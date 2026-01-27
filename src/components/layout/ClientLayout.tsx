import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="page-container">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
