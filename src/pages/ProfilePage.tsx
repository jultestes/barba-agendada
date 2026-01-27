import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Crown, Bell, CreditCard, LogOut, ChevronRight, Shield, Scissors } from 'lucide-react';
import Header from '@/components/layout/Header';
import ClientLayout from '@/components/layout/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useSubscriptionStatus } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Edit2, label: 'Editar Perfil', path: '/perfil/editar' },
  { icon: Crown, label: 'Plano Premium', path: '/premium', highlight: true },
  { icon: Bell, label: 'Notificações', path: '/notificacoes' },
  { icon: CreditCard, label: 'Formas de Pagamento', path: '/pagamentos' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isBarber, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: isSubscriber } = useSubscriptionStatus();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <ClientLayout>
        <Header title="Perfil" showLogo={false} />
        <div className="container px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </ClientLayout>
    );
  }

  if (!user) {
    return (
      <ClientLayout>
        <Header title="Perfil" showLogo={false} />
        <div className="container px-4 py-16 text-center">
          <User className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Entre na sua conta</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para acessar seu perfil e gerenciar agendamentos
          </p>
          <Button onClick={() => navigate('/auth')} className="btn-primary">
            Entrar / Cadastrar
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Header title="Perfil" showLogo={false} />
      
      <div className="container px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="card-premium flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            {isSubscriber && (
              <div className="absolute -top-1 -right-1 badge-premium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                VIP
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {(isAdmin || isBarber) && (
              <div className="flex gap-2 mt-2">
                {isAdmin && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
                {isBarber && (
                  <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full">
                    Barbeiro
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="card-premium flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{profile?.phone || 'Não informado'}</p>
            </div>
          </div>

          <div className="card-premium flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Admin/Barber Access */}
        {(isAdmin || isBarber) && (
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground font-medium">Área Profissional</h3>
            
            {isBarber && (
              <button
                onClick={() => navigate('/barbeiro')}
                className="card-premium w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20">
                    <Scissors className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Painel do Barbeiro</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="card-premium w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Área Administrativa</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          <h3 className="text-sm text-muted-foreground font-medium">Configurações</h3>
          
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "card-premium w-full flex items-center justify-between",
                item.highlight && "border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  item.highlight ? "bg-primary/20" : "bg-secondary"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5",
                    item.highlight ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-medium">{item.label}</span>
                {item.highlight && !isSubscriber && (
                  <span className="badge-premium text-[10px]">NOVO</span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="card-premium w-full flex items-center gap-3 text-destructive"
        >
          <div className="p-2 rounded-xl bg-destructive/10">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Sair da conta</span>
        </button>
      </div>
    </ClientLayout>
  );
}
