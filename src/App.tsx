import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// Client Pages
import BookingPage from "./pages/BookingPage";
import HistoryPage from "./pages/HistoryPage";
import StorePage from "./pages/StorePage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Barber Pages
import BarberDashboard from "./pages/barber/BarberDashboard";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminBarbers from "./pages/admin/AdminBarbers";
import AdminServices from "./pages/admin/AdminServices";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminConfig from "./pages/admin/AdminConfig";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Client Routes */}
              <Route path="/" element={<BookingPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/loja" element={<StorePage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedido/sucesso" element={<OrderSuccessPage />} />

              {/* Barber Routes */}
              <Route path="/barbeiro" element={<BarberDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="barbeiros" element={<AdminBarbers />} />
                <Route path="servicos" element={<AdminServices />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="planos" element={<AdminPlans />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="config" element={<AdminConfig />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
