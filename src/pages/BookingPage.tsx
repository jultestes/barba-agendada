import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, User, Scissors, Calendar, Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import ClientLayout from '@/components/layout/ClientLayout';
import { useBarbers, Barber } from '@/hooks/useBarbers';
import { useServices, Service } from '@/hooks/useServices';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: barbers = [], isLoading: barbersLoading } = useBarbers();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const createAppointment = useCreateAppointment();

  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [servicesSheetOpen, setServicesSheetOpen] = useState(false);
  const [dateTimeSheetOpen, setDateTimeSheetOpen] = useState(false);

  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const today = startOfToday();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Faça login para agendar');
      navigate('/auth');
      return;
    }

    if (!selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos');
      return;
    }

    await createAppointment.mutateAsync({
      barber_id: selectedBarber.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      service_ids: selectedServices.map(s => s.id),
      total_price: totalPrice,
    });

    navigate('/historico');
  };

  const canBook = selectedBarber && selectedServices.length > 0 && selectedDate && selectedTime;

  return (
    <ClientLayout>
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-background to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative container h-full flex flex-col justify-end pb-6 px-4">
          <h2 className="text-2xl font-bold mb-1">Agende seu horário</h2>
          <p className="text-muted-foreground">Escolha o barbeiro, serviços e horário</p>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-4">
        {/* Barbeiro Selection */}
        <button
          onClick={() => setBarberModalOpen(true)}
          className="card-premium w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {selectedBarber?.image_url ? (
                <img src={selectedBarber.image_url} alt={selectedBarber.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Barbeiro</p>
              <p className="font-semibold">
                {selectedBarber ? selectedBarber.name : 'Escolha um barbeiro'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Serviços Selection */}
        <button
          onClick={() => setServicesSheetOpen(true)}
          className="card-premium w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Scissors className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Serviços</p>
              <p className="font-semibold">
                {selectedServices.length > 0 
                  ? `${selectedServices.length} selecionado(s)` 
                  : 'Escolha os serviços'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Data e Hora Selection */}
        <button
          onClick={() => setDateTimeSheetOpen(true)}
          className="card-premium w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Data e Hora</p>
              <p className="font-semibold">
                {selectedDate && selectedTime 
                  ? `${format(selectedDate, "dd 'de' MMM", { locale: ptBR })} às ${selectedTime}` 
                  : 'Escolha data e horário'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Resumo */}
        {selectedServices.length > 0 && (
          <div className="card-premium space-y-3 animate-fade-in">
            <h3 className="font-semibold">Resumo</h3>
            <div className="space-y-2">
              {selectedServices.map(service => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span>R$ {Number(service.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Duração: {totalDuration} min</p>
                <p className="text-lg font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botão Agendar */}
        <button
          onClick={handleBooking}
          disabled={!canBook || createAppointment.isPending}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg transition-all",
            canBook
              ? "btn-primary glow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {createAppointment.isPending ? 'Agendando...' : 'Agendar Horário'}
        </button>
      </div>

      {/* Barbeiro Modal */}
      <Dialog open={barberModalOpen} onOpenChange={setBarberModalOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Escolha o Barbeiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedBarber(null);
                setBarberModalOpen(false);
              }}
              className={cn(
                "w-full p-4 rounded-xl border transition-all flex items-center gap-3",
                !selectedBarber ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Sem preferência</p>
                <p className="text-sm text-muted-foreground">Qualquer barbeiro disponível</p>
              </div>
            </button>
            
            {barbers.map(barber => (
              <button
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber);
                  setBarberModalOpen(false);
                }}
                className={cn(
                  "w-full p-4 rounded-xl border transition-all flex items-center gap-3",
                  selectedBarber?.id === barber.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                  {barber.image_url ? (
                    <img src={barber.image_url} alt={barber.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">{barber.name}</p>
                  {barber.specialty && (
                    <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                  )}
                </div>
                {selectedBarber?.id === barber.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Serviços Sheet */}
      <Sheet open={servicesSheetOpen} onOpenChange={setServicesSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-card border-border rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Escolha os Serviços</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto max-h-[calc(80vh-120px)] pb-20">
            {services.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceToggle(service)}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all flex items-start gap-3",
                    isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox 
                    checked={isSelected}
                    className="mt-1 border-primary data-[state=checked]:bg-primary"
                  />
                  <div className="text-left flex-1">
                    <p className="font-semibold">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-primary font-bold">R$ {Number(service.price).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedServices.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-bottom">
              <button 
                onClick={() => setServicesSheetOpen(false)}
                className="btn-primary w-full"
              >
                Confirmar ({selectedServices.length} serviços) - R$ {totalPrice.toFixed(2)}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Data e Hora Sheet */}
      <Sheet open={dateTimeSheetOpen} onOpenChange={setDateTimeSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-card border-border rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Escolha Data e Horário</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-120px)] pb-20">
            {/* Date Selection */}
            <div>
              <h4 className="text-sm text-muted-foreground mb-3">Data</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {dates.map(date => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex-shrink-0 w-16 py-3 rounded-xl border transition-all text-center",
                      selectedDate && isSameDay(date, selectedDate)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="text-xs uppercase">
                      {format(date, 'EEE', { locale: ptBR })}
                    </p>
                    <p className="text-xl font-bold">{format(date, 'd')}</p>
                    <p className="text-xs">{format(date, 'MMM', { locale: ptBR })}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h4 className="text-sm text-muted-foreground mb-3">Horário</h4>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 rounded-xl border transition-all font-medium",
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {selectedDate && selectedTime && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-bottom">
              <button 
                onClick={() => setDateTimeSheetOpen(false)}
                className="btn-primary w-full"
              >
                Confirmar - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </ClientLayout>
  );
}
