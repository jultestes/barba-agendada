import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Barber {
  id: string;
  name: string;
  specialty: string | null;
  image_url: string | null;
  is_active: boolean;
  user_id: string | null;
  slot_interval_minutes: number;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

export default function AdminBarbers() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    image_url: '',
    is_active: true,
    user_id: '',
    slot_interval_minutes: 30,
  });

  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ['admin-barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Barber[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name')
        .order('full_name');
      if (error) throw error;
      return data as Profile[];
    },
  });

  const createBarber = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('barbers').insert([{
        name: data.name,
        specialty: data.specialty || null,
        image_url: data.image_url || null,
        is_active: data.is_active,
        user_id: data.user_id || null,
        slot_interval_minutes: data.slot_interval_minutes,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
      setModalOpen(false);
      resetForm();
      toast.success('Barbeiro criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar barbeiro'),
  });

  const updateBarber = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('barbers')
        .update({
          name: data.name,
          specialty: data.specialty || null,
          image_url: data.image_url || null,
          is_active: data.is_active,
          user_id: data.user_id || null,
          slot_interval_minutes: data.slot_interval_minutes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
      setModalOpen(false);
      resetForm();
      toast.success('Barbeiro atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar barbeiro'),
  });

  const deleteBarber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('barbers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
      toast.success('Barbeiro excluído');
    },
    onError: () => toast.error('Erro ao excluir barbeiro'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      image_url: '',
      is_active: true,
      user_id: '',
      slot_interval_minutes: 30,
    });
    setEditingBarber(null);
  };

  const openEditModal = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      specialty: barber.specialty || '',
      image_url: barber.image_url || '',
      is_active: barber.is_active,
      user_id: barber.user_id || '',
      slot_interval_minutes: barber.slot_interval_minutes,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingBarber) {
      updateBarber.mutate({ id: editingBarber.id, data: formData });
    } else {
      createBarber.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Barbeiros</h2>
        <Dialog open={modalOpen} onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Barbeiro
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do barbeiro"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Especialidade</label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Cortes modernos, Barbas"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">URL da Imagem</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Vincular a Usuário</label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="">Nenhum</SelectItem>
                    {profiles.map(profile => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Intervalo de Slots (min)</label>
                <Select
                  value={formData.slot_interval_minutes.toString()}
                  onValueChange={(value) => setFormData({ ...formData, slot_interval_minutes: parseInt(value) })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ativo</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createBarber.isPending || updateBarber.isPending}
                  className="flex-1 btn-primary"
                >
                  {editingBarber ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-premium animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum barbeiro cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {barbers.map(barber => (
            <div key={barber.id} className="card-premium flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                {barber.image_url ? (
                  <img src={barber.image_url} alt={barber.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{barber.name}</h3>
                  {barber.is_active ? (
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {barber.specialty && (
                  <p className="text-sm text-muted-foreground truncate">{barber.specialty}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {barber.slot_interval_minutes} min
                  </span>
                  {!barber.user_id && (
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                      Sem usuário vinculado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(barber)}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este barbeiro?')) {
                      deleteBarber.mutate(barber.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
