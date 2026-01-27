import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, X, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import ClientLayout from '@/components/layout/ClientLayout';
import { useUserAppointments, useCancelAppointment, Appointment } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'status-pending',
  },
  confirmed: {
    label: 'Confirmado',
    icon: Check,
    className: 'status-confirmed',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    className: 'status-completed',
  },
  cancelled: {
    label: 'Cancelado',
    icon: X,
    className: 'status-cancelled',
  },
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: appointments = [], isLoading } = useUserAppointments();
  const cancelAppointment = useCancelAppointment();

  if (authLoading) {
    return (
      <ClientLayout>
        <Header title="Histórico" showLogo={false} />
        <div className="container px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </ClientLayout>
    );
  }

  if (!user) {
    return (
      <ClientLayout>
        <Header title="Histórico" showLogo={false} />
        <div className="container px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Faça login para ver seu histórico</h2>
          <p className="text-muted-foreground mb-6">
            Acesse sua conta para visualizar seus agendamentos
          </p>
          <Button onClick={() => navigate('/auth')} className="btn-primary">
            Fazer Login
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Header title="Histórico" showLogo={false} />
      
      <div className="container px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-premium animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Nenhum agendamento</h2>
            <p className="text-muted-foreground mb-6">
              Você ainda não fez nenhum agendamento
            </p>
            <Button onClick={() => navigate('/')} className="btn-primary">
              Agendar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => {
              const status = statusConfig[appointment.status];
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={appointment.id} 
                  className="card-premium animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">
                        {format(new Date(appointment.appointment_date), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-muted-foreground">
                        às {appointment.appointment_time.slice(0, 5)}
                      </p>
                    </div>
                    <span className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                      status.className
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  {appointment.barber && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                        {appointment.barber.image_url ? (
                          <img 
                            src={appointment.barber.image_url} 
                            alt={appointment.barber.name}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="w-full h-full p-2 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm">{appointment.barber.name}</span>
                    </div>
                  )}

                  {appointment.appointment_services && appointment.appointment_services.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {appointment.appointment_services.map((as, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{as.service?.name}</span>
                          <span>R$ {Number(as.price_at_booking).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-lg font-bold text-primary">
                      R$ {Number(appointment.total_price).toFixed(2)}
                    </span>
                    
                    {appointment.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelAppointment.mutate(appointment.id)}
                        disabled={cancelAppointment.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
