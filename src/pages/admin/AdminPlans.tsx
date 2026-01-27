import { Crown } from 'lucide-react';

export default function AdminPlans() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
      <div className="text-center py-12">
        <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Gerenciamento de planos em desenvolvimento</p>
      </div>
    </div>
  );
}
