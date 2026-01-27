-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'barber');

-- Criar enum para status de agendamento
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Criar enum para status de pedido
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Criar enum para status de assinatura
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'paused', 'expired');

-- 1. TABELA PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABELA USER_ROLES (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. TABELA BARBERS
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABELA SERVICES
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABELA BARBER_SERVICES (serviços exclusivos do barbeiro)
CREATE TABLE public.barber_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABELA BARBER_WORKING_HOURS
CREATE TABLE public.barber_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  break_start TIME,
  break_end TIME,
  is_working BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(barber_id, day_of_week)
);

-- 7. TABELA SCHEDULE_BLOCKS (bloqueios de horário)
CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABELA APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABELA APPOINTMENT_SERVICES
CREATE TABLE public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  price_at_booking DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABELA PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. TABELA CART_ITEMS
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 12. TABELA ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  address JSONB,
  notes TEXT,
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. TABELA ORDER_ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. TABELA SUBSCRIPTION_PLANS
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  benefits JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. TABELA USER_SUBSCRIPTIONS
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
  mercadopago_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. TABELA SUBSCRIPTION_PAYMENTS
CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
  mercadopago_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FUNÇÕES HELPER (SECURITY DEFINER)

-- Função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Função is_barber
CREATE OR REPLACE FUNCTION public.is_barber(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'barber')
$$;

-- Função get_barber_id_for_user
CREATE OR REPLACE FUNCTION public.get_barber_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.barbers WHERE user_id = _user_id LIMIT 1
$$;

-- Função is_active_subscriber
CREATE OR REPLACE FUNCTION public.is_active_subscriber(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND current_period_end > now()
  )
$$;

-- Função para verificar se usuário é dono do barbeiro
CREATE OR REPLACE FUNCTION public.is_owner_barber(_barber_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.barbers
    WHERE id = _barber_id
      AND user_id = auth.uid()
  )
$$;

-- Função para obter barbeiros públicos
CREATE OR REPLACE FUNCTION public.get_public_barbers()
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT,
  image_url TEXT,
  slot_interval_minutes INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, specialty, image_url, slot_interval_minutes
  FROM public.barbers
  WHERE is_active = true
$$;

-- TRIGGER para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TRIGGER para criar profile e role ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER para sincronizar role de barbeiro
CREATE OR REPLACE FUNCTION public.sync_barber_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id != NEW.user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'barber')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  IF NEW.user_id IS NULL AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles
    WHERE user_id = OLD.user_id AND role = 'barber';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_barber_user_linked
  AFTER UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.sync_barber_role();

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- Barbers
CREATE POLICY "Anyone can view active barbers" ON public.barbers
  FOR SELECT USING (is_active = true OR public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Admins can manage barbers" ON public.barbers
  FOR ALL USING (public.is_admin());

CREATE POLICY "Barbers can update own profile" ON public.barbers
  FOR UPDATE USING (user_id = auth.uid());

-- Services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- Barber Services
CREATE POLICY "View barber services" ON public.barber_services
  FOR SELECT USING (
    public.is_admin() OR 
    public.is_owner_barber(barber_id) OR
    EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND is_active = true)
  );

CREATE POLICY "Barbers manage own services" ON public.barber_services
  FOR ALL USING (public.is_admin() OR public.is_owner_barber(barber_id));

-- Barber Working Hours
CREATE POLICY "View working hours" ON public.barber_working_hours
  FOR SELECT USING (
    public.is_admin() OR 
    public.is_owner_barber(barber_id) OR
    EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND is_active = true)
  );

CREATE POLICY "Manage working hours" ON public.barber_working_hours
  FOR ALL USING (public.is_admin() OR public.is_owner_barber(barber_id));

-- Schedule Blocks
CREATE POLICY "View schedule blocks" ON public.schedule_blocks
  FOR SELECT USING (
    public.is_admin() OR 
    public.is_owner_barber(barber_id) OR
    EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND is_active = true)
  );

CREATE POLICY "Manage schedule blocks" ON public.schedule_blocks
  FOR ALL USING (public.is_admin() OR public.is_owner_barber(barber_id));

-- Appointments
CREATE POLICY "Users view own appointments" ON public.appointments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND user_id = auth.uid())
  );

CREATE POLICY "Users create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own appointments" ON public.appointments
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND user_id = auth.uid())
  );

CREATE POLICY "Users delete pending appointments" ON public.appointments
  FOR DELETE USING (
    (user_id = auth.uid() AND status = 'pending') OR 
    public.is_admin()
  );

-- Appointment Services
CREATE POLICY "View appointment services" ON public.appointment_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id 
      AND (user_id = auth.uid() OR public.is_admin() OR 
           EXISTS (SELECT 1 FROM public.barbers WHERE id = barber_id AND user_id = auth.uid()))
    )
  );

CREATE POLICY "Create appointment services" ON public.appointment_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id AND user_id = auth.uid()
    )
  );

-- Products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- Cart Items
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- Orders
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Order Items
CREATE POLICY "View order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR 
    public.is_admin()
  );

CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Subscription Plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage plans" ON public.subscription_plans
  FOR ALL USING (public.is_admin());

-- User Subscriptions
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users create own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Subscription Payments
CREATE POLICY "View subscription payments" ON public.subscription_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_subscriptions WHERE id = subscription_id AND user_id = auth.uid()) OR 
    public.is_admin()
  );

CREATE POLICY "Admins manage payments" ON public.subscription_payments
  FOR ALL USING (public.is_admin());

-- CRIAR BUCKET DE STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('barbers', 'barbers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Políticas de Storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Barber images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'barbers');

CREATE POLICY "Admins can manage barber images" ON storage.objects
  FOR ALL USING (bucket_id = 'barbers' AND public.is_admin());

CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admins can manage product images" ON storage.objects
  FOR ALL USING (bucket_id = 'products' AND public.is_admin());

-- INSERIR DADOS INICIAIS

-- Serviços padrão
INSERT INTO public.services (name, description, price, duration_minutes) VALUES
  ('Corte Clássico', 'Corte tradicional com acabamento impecável', 45.00, 30),
  ('Barba Completa', 'Aparar, modelar e hidratar sua barba', 35.00, 25),
  ('Combo Premium', 'Corte + Barba + Sobrancelha + Hidratação', 85.00, 60),
  ('Corte Degradê', 'Corte moderno com degradê perfeito', 55.00, 40),
  ('Sobrancelha', 'Design e limpeza de sobrancelha', 15.00, 15);

-- Plano de assinatura padrão
INSERT INTO public.subscription_plans (name, description, price, benefits) VALUES
  ('Premium Mensal', 'Cortes ilimitados + Prioridade no agendamento', 149.90, '["Cortes ilimitados", "Prioridade no agendamento", "Desconto de 20% em produtos", "Acesso VIP"]');

-- Produtos exemplo
INSERT INTO public.products (name, description, price, category, stock_quantity) VALUES
  ('Pomada Modeladora', 'Fixação forte com brilho natural', 45.00, 'Pomada', 20),
  ('Óleo para Barba', 'Hidrata e amacia os fios', 35.00, 'Óleo', 15),
  ('Shampoo Antiqueda', 'Fortalece e previne a queda', 55.00, 'Shampoo', 25),
  ('Gel Fixador', 'Fixação extra forte', 25.00, 'Gel', 30),
  ('Balm para Barba', 'Modelador e condicionador', 40.00, 'Balm', 18);

-- Índices para performance
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);