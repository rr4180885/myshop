import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  code: string;
  quantity: number;
  sellingPrice: number;
  gstRate: number;
}

export default function BillingTab() {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      return res.json();
    },
  });

  const invoiceCounterMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const counter = parseInt(localStorage.getItem("invoiceCounter") || "1");
      const invoiceNumber = `INV-2024-${String(counter).padStart(4, "0")}`;
      localStorage.setItem("invoiceCounter", String(counter + 1));

      const cartItems = items.map(item => ({
        ...item,
        amount: (item.quantity * item.sellingPrice).toFixed(2)
      }));

      const subtotal = items.reduce((sum, item) => {
        const gstAmount = (item.quantity * item.sellingPrice * item.gstRate) / (100 + item.gstRate);
        return sum + (item.quantity * item.sellingPrice - gstAmount);
      }, 0);

      const gstAmount = items.reduce((sum, item) => {
        const gst = (item.quantity * item.sellingPrice * item.gstRate) / (100 + item.gstRate);
        return sum + gst;
      }, 0);

      const grandTotal = items.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);

      const invoiceData = {
        invoiceNumber,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        items: JSON.stringify(cartItems),
        subtotal: subtotal.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
      };

      await apiRequest("POST", api.invoices.create.path, invoiceData);

      // Update product stock
      for (const item of items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await apiRequest("PUT", api.products.update.path.replace(":id", String(item.id)), {
            stock: product.stock - item.quantity
          });
        }
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      toast({ title: "Invoice generated successfully" });
      window.print();
    },
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          code: product.code,
          quantity: 1,
          sellingPrice: Number(product.sellingPrice),
          gstRate: product.gstRate,
        }]);
      } else {
        toast({ title: "Out of stock", variant: "destructive" });
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    const gstAmount = (item.quantity * item.sellingPrice * item.gstRate) / (100 + item.gstRate);
    return sum + (item.quantity * item.sellingPrice - gstAmount);
  }, 0);

  const gstAmount = cart.reduce((sum, item) => {
    return sum + (item.quantity * item.sellingPrice * item.gstRate) / (100 + item.gstRate);
  }, 0);

  const grandTotal = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              data-testid="input-customer-name"
            />
            <Input
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              data-testid="input-customer-phone"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, brand, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-product-search"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50" data-testid={`card-product-${product.id}`}>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.code} - ₹{product.sellingPrice}</div>
                    <div className={`text-xs ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>
                      Stock: {product.stock}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-4" data-testid="card-cart">
          <CardHeader>
            <CardTitle className="text-lg">Cart ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="border rounded p-2 space-y-1" data-testid={`cart-item-${item.id}`}>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-12 text-center"
                      data-testid={`input-quantity-${item.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-sm">₹{(item.quantity * item.sellingPrice).toFixed(2)}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span data-testid="text-gst">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1 border-t">
                <span>Total:</span>
                <span data-testid="text-grand-total">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => invoiceCounterMutation.mutate(cart)}
              disabled={cart.length === 0 || invoiceCounterMutation.isPending}
              data-testid="button-generate-invoice"
            >
              Generate Invoice & Print
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
