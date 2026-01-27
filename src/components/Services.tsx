import { Scissors, Sparkles, Crown } from "lucide-react";

const services = [
  {
    icon: Scissors,
    name: "Corte Clássico",
    description: "Corte tradicional com acabamento impecável",
    price: "R$ 45",
    duration: "30 min"
  },
  {
    icon: Sparkles,
    name: "Barba Completa",
    description: "Aparar, modelar e hidratar sua barba",
    price: "R$ 35",
    duration: "25 min"
  },
  {
    icon: Crown,
    name: "Combo Premium",
    description: "Corte + Barba + Sobrancelha + Hidratação",
    price: "R$ 85",
    duration: "60 min"
  }
];

const Services = () => {
  return (
    <section className="py-20 px-4">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="text-gradient">Serviços</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={service.name}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-center mb-2">
                {service.name}
              </h3>
              
              <p className="text-muted-foreground text-center text-sm mb-4">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-primary font-bold text-xl">{service.price}</span>
                <span className="text-muted-foreground text-sm">{service.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
