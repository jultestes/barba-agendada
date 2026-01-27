import { MapPin, Phone, Clock, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4 text-gradient">Localização</h4>
            <div className="flex items-start justify-center md:justify-start gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <p>Rua Principal, 123<br />Centro - Sua Cidade</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4 text-gradient">Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <p>(00) 99999-9999</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <Instagram className="w-5 h-5 text-primary" />
                <p>@barbeariapremium</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4 text-gradient">Horário</h4>
            <div className="flex items-start justify-center md:justify-start gap-2 text-muted-foreground">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p>Seg - Sex: 09h às 20h</p>
                <p>Sábado: 09h às 18h</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Barbearia Premium. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
