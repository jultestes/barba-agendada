import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import ClientLayout from '@/components/layout/ClientLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const [address, setAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (items.length === 0) {
      navigate('/loja');
    }
  }, [user, items, navigate]);

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setAddress(prev => ({ ...prev, cep: cleanCep }));

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setAddress(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!address.cep || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      toast.error('Preencha todos os campos de endereço');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user!.id,
          total: totalPrice,
          address: JSON.parse(JSON.stringify(address)),
          notes: notes,
          status: 'pending' as const,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast.success('Pedido criado com sucesso!');
      navigate('/pedido/sucesso', { state: { orderId: order.id } });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <header className="sticky top-0 z-40 glass border-b border-border safe-top">
        <div className="container flex items-center gap-3 h-16 px-4">
          <button
            onClick={() => navigate('/loja')}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Address Form */}
        <div className="card-premium space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Endereço de Entrega</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1">
              <label className="text-sm text-muted-foreground mb-1 block">CEP</label>
              <Input
                value={address.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className="input-field"
              />
              {loadingCep && (
                <p className="text-xs text-muted-foreground mt-1">Buscando...</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Rua</label>
            <Input
              value={address.street}
              onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
              placeholder="Nome da rua"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Número</label>
              <Input
                value={address.number}
                onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                placeholder="123"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Complemento</label>
              <Input
                value={address.complement}
                onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                placeholder="Apt, Bloco..."
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Bairro</label>
            <Input
              value={address.neighborhood}
              onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
              placeholder="Bairro"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cidade</label>
              <Input
                value={address.city}
                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Estado</label>
              <Input
                value={address.state}
                onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="UF"
                maxLength={2}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card-premium space-y-3">
          <h2 className="font-bold">Observações</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação sobre a entrega?"
            className="input-field min-h-[100px]"
          />
        </div>

        {/* Order Summary */}
        <div className="card-premium space-y-3">
          <h2 className="font-bold">Resumo do Pedido</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product?.name} x{item.quantity}
                </span>
                <span>R$ {(Number(item.product?.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full glow flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {loading ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </div>
    </ClientLayout>
  );
}
