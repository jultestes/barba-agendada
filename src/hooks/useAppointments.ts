import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  user_id: string;
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  notes: string | null;
  created_at: string;
  barber?: {
    name: string;
    image_url: string | null;
  };
  appointment_services?: {
    service: {
      name: string;
      price: number;
    };
    price_at_booking: number;
  }[];
}

export function useUserAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-appointments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barber:barbers (
            name,
            image_url
          ),
          appointment_services (
            price_at_booking,
            service:services (
              name,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data as unknown as Appointment[];
    },
    enabled: !!user,
  });
}

interface CreateAppointmentData {
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  service_ids: string[];
  total_price: number;
  notes?: string;
}

export function useCreateAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          barber_id: data.barber_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          total_price: data.total_price,
          notes: data.notes,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Get services prices
      const { data: services } = await supabase
        .from('services')
        .select('id, price')
        .in('id', data.service_ids);

      // Create appointment services
      if (services && services.length > 0) {
        const appointmentServices = services.map(service => ({
          appointment_id: appointment.id,
          service_id: service.id,
          price_at_booking: service.price,
        }));

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(appointmentServices);

        if (servicesError) throw servicesError;
      }

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
      toast.success('Agendamento realizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
      toast.success('Agendamento cancelado');
    },
    onError: () => {
      toast.error('Erro ao cancelar agendamento');
    },
  });
}
