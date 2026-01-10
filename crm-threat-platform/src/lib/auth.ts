import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { auditLog, users, tenantMemberships } from '@/lib/db/schema';
import { loginRateLimiter } from '@/lib/security/login-rate-limit';
import { verifyTotp } from '@/lib/security/totp';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { headers } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totp: z.string().optional(),
});

const getRequestMetadata = () => {
  const headerStore = headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim()
    ?? headerStore.get('x-real-ip')
    ?? 'unknown';

  return {
    ipAddress,
    userAgent: headerStore.get('user-agent') ?? 'unknown',
  };
};

const recordAuthEvent = async ({
  action,
  userId,
  email,
  ipAddress,
  userAgent,
  suspicious,
  details,
}: {
  action: string;
  userId?: string | null;
  email?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  suspicious: boolean;
  details?: Record<string, unknown>;
}) => {
  const entityId = userId ?? email ?? 'unknown';
  await db.insert(auditLog).values({
    userId: userId ?? null,
    action,
    entityType: 'auth',
    entityId,
    changes: details ? { email, ...details } : email ? { email } : null,
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
    suspicious,
  });
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: DrizzleAdapter removed - not needed for JWT sessions
  // The adapter is only required for database sessions
  trustHost: true, // Required for NextAuth v5 in development
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        const { ipAddress, userAgent } = getRequestMetadata();

        if (!validatedFields.success) {
          await recordAuthEvent({
            action: 'auth_login_invalid',
            email: credentials?.email ? String(credentials.email) : null,
            ipAddress,
            userAgent,
            suspicious: true,
            details: { reason: 'invalid_payload' },
          });
          return null;
        }

        const { email, password, totp } = validatedFields.data;
        const normalizedEmail = email.toLowerCase();
        const rateLimitStatus = loginRateLimiter.checkStatus({ ip: ipAddress, email: normalizedEmail });

        if (rateLimitStatus.locked) {
          await recordAuthEvent({
            action: 'auth_login_throttled',
            email: normalizedEmail,
            ipAddress,
            userAgent,
            suspicious: true,
            details: { reason: 'rate_limited', scope: rateLimitStatus.reason },
          });
          return null;
        }

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (!user || !user.passwordHash) {
          const failureStatus = loginRateLimiter.recordFailure({ ip: ipAddress, email: normalizedEmail });
          await recordAuthEvent({
            action: 'auth_login_failed',
            email: normalizedEmail,
            ipAddress,
            userAgent,
            suspicious: true,
            details: { reason: 'unknown_user', scope: failureStatus.reason },
          });
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          const failureStatus = loginRateLimiter.recordFailure({ ip: ipAddress, email: normalizedEmail });
          await recordAuthEvent({
            action: 'auth_login_failed',
            userId: user.id,
            email: normalizedEmail,
            ipAddress,
            userAgent,
            suspicious: true,
            details: { reason: 'invalid_password', scope: failureStatus.reason },
          });
          return null;
        }

        const [membership] = await db
          .select()
          .from(tenantMemberships)
          .where(eq(tenantMemberships.userId, user.id))
          .limit(1);

        if (!membership) {
          return null;
        }

        if (user.role === 'admin' && user.mfaEnabled) {
          if (!user.mfaSecret || !totp) {
            const failureStatus = loginRateLimiter.recordFailure({ ip: ipAddress, email: normalizedEmail });
            await recordAuthEvent({
              action: 'auth_mfa_missing',
              userId: user.id,
              email: normalizedEmail,
              ipAddress,
              userAgent,
              suspicious: true,
              details: { reason: 'mfa_required', scope: failureStatus.reason },
            });
            return null;
          }

          const mfaValid = await verifyTotp({ secret: user.mfaSecret, token: totp });

          if (!mfaValid) {
            const failureStatus = loginRateLimiter.recordFailure({ ip: ipAddress, email: normalizedEmail });
            await recordAuthEvent({
              action: 'auth_mfa_failed',
              userId: user.id,
              email: normalizedEmail,
              ipAddress,
              userAgent,
              suspicious: true,
              details: { reason: 'mfa_invalid', scope: failureStatus.reason },
            });
            return null;
          }
        }

        loginRateLimiter.recordSuccess({ ip: ipAddress, email: normalizedEmail });
        await recordAuthEvent({
          action: 'auth_login_success',
          userId: user.id,
          email: normalizedEmail,
          ipAddress,
          userAgent,
          suspicious: false,
          details: {
            mfaRequired: user.role === 'admin' && user.mfaEnabled,
          },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: membership.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'editor' | 'viewer';
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },
  },
});
