import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Users, Scissors, ShoppingBag, Crown, UserCog, Settings, ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const tabs = [
  { id: 'barbeiros', label: 'Barbeiros', icon: Users, path: '/admin/barbeiros' },
  { id: 'servicos', label: 'Serviços', icon: Scissors, path: '/admin/servicos' },
  { id: 'produtos', label: 'Produtos', icon: ShoppingBag, path: '/admin/produtos' },
  { id: 'planos', label: 'Planos', icon: Crown, path: '/admin/planos' },
  { id: 'usuarios', label: 'Usuários', icon: UserCog, path: '/admin/usuarios' },
  { id: 'config', label: 'Config', icon: Settings, path: '/admin/config' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/barbeiros');
    }
  }, [location.pathname, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Settings className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Esta área é exclusiva para administradores
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const currentTab = tabs.find(t => location.pathname.startsWith(t.path));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border safe-top">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/perfil')}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold">Área Admin</h1>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/80">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-border w-64">
              <div className="mt-6 space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigate(tab.path);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                      location.pathname.startsWith(tab.path)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block border-t border-border">
          <div className="container flex gap-1 px-4 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  location.pathname.startsWith(tab.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Current Tab */}
        <div className="lg:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-4 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname.startsWith(tab.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
