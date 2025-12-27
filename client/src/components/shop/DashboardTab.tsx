import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@shared/routes";

export default function DashboardTab() {
  const { data: products = [] } = useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      return res.json();
    },
  });

  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + (Number(p.purchasePrice) * p.stock),
    0
  );
  const lowStockCount = products.filter((p) => p.stock < 10).length;
  const lowStockItems = products.filter((p) => p.stock < 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card data-testid="card-total-products">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stock-value">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalStockValue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-low-stock">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50" data-testid="card-low-stock-alert">
          <CardHeader>
            <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-orange-800"
                  data-testid={`text-low-stock-${item.id}`}
                >
                  <span>{item.name} ({item.code})</span>
                  <span>Stock: {item.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
