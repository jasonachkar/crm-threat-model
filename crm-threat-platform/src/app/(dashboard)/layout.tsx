import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, FileText, CheckSquare, Image, Activity, LogOut, 
  BarChart3, Target, Layers, FileStack, Crosshair
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Activity, description: 'Executive overview' },
    { name: 'Threats', href: '/threats', icon: Shield, description: 'Threat registry' },
    { name: 'Requirements', href: '/requirements', icon: CheckSquare, description: 'Security controls' },
    { name: 'Mitigations', href: '/mitigations', icon: FileText, description: 'Remediation roadmap' },
    { 
      name: 'Compliance', 
      href: '/compliance', 
      icon: FileStack, 
      description: 'Framework mapping',
      badge: 'NEW' 
    },
    { 
      name: 'ATT&CK Matrix', 
      href: '/attack-matrix', 
      icon: Crosshair, 
      description: 'MITRE ATT&CK',
      badge: 'NEW' 
    },
    { 
      name: 'Attack Surface', 
      href: '/attack-surface', 
      icon: Layers, 
      description: 'Component analysis',
      badge: 'NEW' 
    },
    { name: 'Diagrams', href: '/diagrams', icon: Image, description: 'Architecture views' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-white shadow-sm">
        <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <Shield className="h-7 w-7 text-white" />
          <div className="ml-3">
            <span className="font-bold text-white">ThreatManager</span>
            <p className="text-xs text-blue-100">Security Platform</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Threat Intelligence
          </p>
          
          {navigation.slice(0, 4).map((item) => (
            <Link key={item.name} href={item.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-blue-50 hover:text-blue-700"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Button>
            </Link>
          ))}
          
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 mt-6">
            Analytics & Compliance
          </p>
          
          {navigation.slice(4, 7).map((item) => (
            <Link key={item.name} href={item.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-blue-50 hover:text-blue-700"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Button>
            </Link>
          ))}
          
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 mt-6">
            Resources
          </p>
          
          {navigation.slice(7).map((item) => (
            <Link key={item.name} href={item.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-blue-50 hover:text-blue-700"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Button>
            </Link>
          ))}
        </nav>
        
        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50 w-72">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.email}</p>
              <Badge variant="outline" className="text-xs capitalize">
                {session.user.role}
              </Badge>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <Button type="submit" variant="ghost" size="icon" title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">CRM Threat Management Platform</h1>
            <p className="text-sm text-gray-500">Enterprise security threat intelligence and compliance tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              System Operational
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
