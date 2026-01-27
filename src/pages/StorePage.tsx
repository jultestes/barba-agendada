import { useState } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import ClientLayout from '@/components/layout/ClientLayout';
import { useProducts, useProductCategories, Product } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function StorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cartOpen, setCartOpen] = useState(false);

  const { data: products = [], isLoading } = useProducts(selectedCategory);
  const { data: categories = [] } = useProductCategories();
  const { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity } = useCart();

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      navigate('/auth');
      return;
    }
    addToCart(product.id);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <ClientLayout>
      <Header 
        rightContent={
          <button 
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        }
      />

      <div className="container px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-10 input-field"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-premium animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="card-premium animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative aspect-square bg-secondary rounded-xl mb-3 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="destructive">Esgotado</Badge>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      product.stock_quantity > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho ({totalItems})
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-140px)] mt-4">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 bg-secondary rounded-xl">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{item.product?.name}</h4>
                        <p className="text-primary font-bold text-sm">
                          R$ {Number(item.product?.price).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-lg bg-muted hover:bg-muted/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-lg bg-muted hover:bg-muted/80"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-lg text-destructive hover:bg-destructive/10 ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={handleCheckout} className="btn-primary w-full">
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </ClientLayout>
  );
}
