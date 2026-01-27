import { Scissors } from 'lucide-react';

interface HeaderProps {
  showLogo?: boolean;
  title?: string;
  rightContent?: React.ReactNode;
}

export default function Header({ showLogo = true, title, rightContent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border safe-top">
      <div className="container flex items-center justify-between h-16 px-4">
        {showLogo ? (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Scissors className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">BARBEARIA</h1>
              <p className="text-xs text-muted-foreground">Premium</p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold">{title}</h1>
        )}
        
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
