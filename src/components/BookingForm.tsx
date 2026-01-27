import { useState } from "react";
import { Calendar, Clock, User, Phone, Scissors, Check } from "lucide-react";
import { toast } from "sonner";

const services = [
  { id: "corte", name: "Corte Clássico", price: "R$ 45" },
  { id: "barba", name: "Barba Completa", price: "R$ 35" },
  { id: "combo", name: "Combo Premium", price: "R$ 85" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsSubmitted(true);
    toast.success("Agendamento realizado com sucesso!");
  };

  if (isSubmitted) {
    return (
      <section id="agendar" className="py-20 px-4">
        <div className="container max-w-lg mx-auto">
          <div className="bg-card border border-primary/30 rounded-2xl p-8 text-center glow animate-scale-in">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-2xl font-bold mb-2">Agendamento Confirmado!</h3>
            <p className="text-muted-foreground mb-6">
              {formData.name}, seu horário está reservado para {new Date(formData.date).toLocaleDateString('pt-BR')} às {formData.time}.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: "", phone: "", service: "", date: "", time: "" });
              }}
              className="text-primary hover:underline"
            >
              Fazer novo agendamento
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="agendar" className="py-20 px-4">
      <div className="container max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Agende seu <span className="text-gradient">Horário</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>
        
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4 text-primary" />
              Seu Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite seu nome"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          
          {/* Telefone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          
          {/* Serviço */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Scissors className="w-4 h-4 text-primary" />
              Serviço
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-card">Selecione um serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id} className="bg-card">
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </div>
          
          {/* Data */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
            />
          </div>
          
          {/* Horário */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Horário
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, time })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    formData.time === time
                      ? "bg-primary text-primary-foreground"
                      : "bg-input border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] glow"
          >
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
