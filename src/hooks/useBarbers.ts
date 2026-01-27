import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Barber {
  id: string;
  name: string;
  specialty: string | null;
  image_url: string | null;
  slot_interval_minutes: number;
  is_active: boolean;
}

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Barber[];
    },
  });
}

export function useBarber(id: string | undefined) {
  return useQuery({
    queryKey: ['barber', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Barber;
    },
    enabled: !!id,
  });
}
