import { Scissors } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <div className="container relative z-10 text-center px-4">
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="p-4 rounded-full border-2 border-primary/50 glow">
            <Scissors className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="text-gradient">Barbearia</span>
          <br />
          <span className="text-foreground">Premium</span>
        </h1>
        
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }} />
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto mb-8 font-body animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Estilo e tradição em cada corte. Agende seu horário e experimente o melhor da barbearia.
        </p>
        
        <a 
          href="#agendar" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 glow animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          Agendar Horário
        </a>
      </div>
    </section>
  );
};

export default Hero;
