import { Settings } from 'lucide-react';

export default function AdminConfig() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações</h2>
      <div className="text-center py-12">
        <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Configurações em desenvolvimento</p>
      </div>
    </div>
  );
}
