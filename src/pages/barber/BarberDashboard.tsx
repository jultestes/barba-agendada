import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Menu,
  Link as LinkIcon,
  Scissors,
  Calendar,
  CalendarOff,
  Users,
  XCircle,
  DollarSign,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  Phone,
  User,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface BarberAppointment {
  id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  notes: string | null;
  profile?: {
    full_name: string;
    phone: string | null;
  };
  appointment_services?: {
    service: {
      name: string;
    };
    price_at_booking: number;
  }[];
}

export default function BarberDashboard() {
  const navigate = useNavigate();
  const { user, isBarber, isAdmin, signOut, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showValues, setShowValues] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check access
  useEffect(() => {
    if (!authLoading && !isBarber && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isBarber, isAdmin, navigate]);

  // Get barber profile
  const { data: barberProfile } = useQuery({
    queryKey: ['barber-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Get appointments for the week
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['barber-appointments', barberProfile?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!barberProfile) return [];
      
      const weekEnd = addDays(weekStart, 6);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profile:profiles!appointments_user_id_fkey (
            full_name,
            phone
          ),
          appointment_services (
            price_at_booking,
            service:services (
              name
            )
          )
        `)
        .eq('barber_id', barberProfile.id)
        .gte('appointment_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('appointment_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('appointment_time');

      if (error) throw error;
      return data as unknown as BarberAppointment[];
    },
    enabled: !!barberProfile,
  });

  // Update appointment status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-appointments'] });
      toast.success('Status atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayAppointments = appointments.filter(a => 
    a.appointment_date === format(new Date(), 'yyyy-MM-dd') &&
    a.status !== 'cancelled'
  );
  
  const weekAppointments = appointments.filter(a => a.status !== 'cancelled');
  
  const todayRevenue = todayAppointments.reduce((sum, a) => sum + Number(a.total_price), 0);
  const weekRevenue = weekAppointments.reduce((sum, a) => sum + Number(a.total_price), 0);

  const selectedDayAppointments = appointments.filter(a => 
    a.appointment_date === format(selectedDate, 'yyyy-MM-dd')
  );

  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const menuItems = [
    { icon: LinkIcon, label: 'Link de agendamento', action: () => {} },
    { icon: Scissors, label: 'Meus serviços', action: () => {} },
    { icon: CalendarOff, label: 'Bloquear horários', action: () => {} },
    { icon: Calendar, label: 'Liberar horários', action: () => {} },
    { icon: Users, label: 'Clientes', action: () => {} },
    { icon: XCircle, label: 'Cancelados', action: () => {} },
    { icon: DollarSign, label: 'Receita', action: () => {} },
    { icon: BarChart, label: 'Relatório', action: () => {} },
    { icon: Settings, label: 'Configurações', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', action: () => {} },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isBarber && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Esta área é exclusiva para barbeiros
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border safe-top">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="font-bold">{barberProfile?.name || 'Barbeiro'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
            >
              {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/80">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-border">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  {menuItems.map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-border my-4" />
                  <button
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="font-medium">
            {format(weekStart, "dd 'de' MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd 'de' MMM", { locale: ptBR })}
          </span>
          
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayAppointments = appointments.filter(a => 
              a.appointment_date === format(day, 'yyyy-MM-dd') && 
              a.status !== 'cancelled'
            );

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex-shrink-0 w-14 py-3 rounded-xl border transition-all text-center relative",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : isToday
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="text-xs uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className="text-xl font-bold">{format(day, 'd')}</p>
                {dayAppointments.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-primary-foreground text-xs flex items-center justify-center">
                    {dayAppointments.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-premium">
            <p className="text-sm text-muted-foreground mb-1">Hoje</p>
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
            <p className="text-sm text-muted-foreground">agendamentos</p>
            <p className={cn("text-lg font-bold mt-2", showValues ? "text-primary" : "blur-sm")}>
              R$ {showValues ? todayRevenue.toFixed(2) : '••••'}
            </p>
          </div>
          <div className="card-premium">
            <p className="text-sm text-muted-foreground mb-1">Esta semana</p>
            <p className="text-2xl font-bold">{weekAppointments.length}</p>
            <p className="text-sm text-muted-foreground">agendamentos</p>
            <p className={cn("text-lg font-bold mt-2", showValues ? "text-primary" : "blur-sm")}>
              R$ {showValues ? weekRevenue.toFixed(2) : '••••'}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="font-bold mb-4">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-premium animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayAppointments.map(appointment => {
                const statusColors = {
                  pending: 'status-pending',
                  confirmed: 'status-confirmed',
                  completed: 'status-completed',
                  cancelled: 'status-cancelled',
                };

                return (
                  <div key={appointment.id} className="card-premium">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-bold">{appointment.appointment_time.slice(0, 5)}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          statusColors[appointment.status]
                        )}>
                          {appointment.status === 'pending' && 'Pendente'}
                          {appointment.status === 'confirmed' && 'Confirmado'}
                          {appointment.status === 'completed' && 'Concluído'}
                          {appointment.status === 'cancelled' && 'Cancelado'}
                        </span>
                      </div>
                      <span className={cn("font-bold", showValues ? "text-primary" : "blur-sm")}>
                        R$ {showValues ? Number(appointment.total_price).toFixed(2) : '••'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.profile?.full_name || 'Cliente'}</span>
                    </div>

                    {appointment.profile?.phone && (
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{appointment.profile.phone}</span>
                      </div>
                    )}

                    {appointment.appointment_services && appointment.appointment_services.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {appointment.appointment_services.map((as, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{as.service?.name}</span>
                            <span className={showValues ? "" : "blur-sm"}>
                              R$ {showValues ? Number(as.price_at_booking).toFixed(2) : '••'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <button
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: 'confirmed' })}
                          className="flex-1 py-2 rounded-xl bg-primary/20 text-primary font-medium hover:bg-primary/30 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: 'cancelled' })}
                          className="flex-1 py-2 rounded-xl bg-destructive/20 text-destructive font-medium hover:bg-destructive/30 flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <div className="pt-3 border-t border-border">
                        <button
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: 'completed' })}
                          className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                        >
                          Marcar como Concluído
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
