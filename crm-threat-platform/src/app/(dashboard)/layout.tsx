import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { Shield, FileText, CheckSquare, Image, Activity, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="flex h-16 items-center border-b px-6">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="ml-2 font-semibold">Threat Manager</span>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/threats">
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Threats
            </Button>
          </Link>
          <Link href="/requirements">
            <Button variant="ghost" className="w-full justify-start">
              <CheckSquare className="mr-2 h-4 w-4" />
              Requirements
            </Button>
          </Link>
          <Link href="/mitigations">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Mitigations
            </Button>
          </Link>
          <Link href="/diagrams">
            <Button variant="ghost" className="w-full justify-start">
              <Image className="mr-2 h-4 w-4" />
              Diagrams
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div>
            <h1 className="text-xl font-semibold">CRM Threat Management</h1>
            <p className="text-sm text-gray-500">Manage and track security threats</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
