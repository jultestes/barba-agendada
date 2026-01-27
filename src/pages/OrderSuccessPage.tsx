import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-6 rounded-full bg-green-500/20 mb-6 animate-scale-in">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Pedido Realizado!
        </h1>
        
        <p className="text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Seu pedido foi recebido e está sendo processado. Em breve você receberá atualizações sobre o status.
        </p>

        {orderId && (
          <p className="text-sm text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Número do pedido: <span className="font-mono text-foreground">{orderId.slice(0, 8)}</span>
          </p>
        )}

        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button onClick={() => navigate('/loja')} className="btn-primary w-full">
            Continuar Comprando
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
