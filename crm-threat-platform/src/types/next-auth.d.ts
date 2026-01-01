import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'admin' | 'editor' | 'viewer';
    };
  }

  interface User {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'editor' | 'viewer';
  }
}
