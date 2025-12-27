import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InventoryTab() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const { data: products = [] } = useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", api.products.delete.path.replace(":id", String(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Product deleted" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest("PUT", api.products.update.path.replace(":id", String(id)), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      setEditingId(null);
      toast({ title: "Product updated" });
    },
  });

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditValues(product);
  };

  const saveEdit = (id: number) => {
    updateMutation.mutate({ id, ...editValues });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Product Name</th>
              <th className="text-left p-2">Brand</th>
              <th className="text-right p-2">Stock</th>
              <th className="text-right p-2">Purchase Price</th>
              <th className="text-right p-2">Selling Price</th>
              <th className="text-right p-2">GST %</th>
              <th className="text-center p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50" data-testid={`row-product-${product.id}`}>
                <td className="p-2">{product.code}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.brand}</td>
                <td className={`text-right p-2 font-semibold ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editValues.stock}
                      onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) })}
                      className="w-20"
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="text-right p-2">
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editValues.purchasePrice}
                      onChange={(e) => setEditValues({ ...editValues, purchasePrice: e.target.value })}
                      className="w-24"
                    />
                  ) : (
                    `₹${product.purchasePrice}`
                  )}
                </td>
                <td className="text-right p-2">
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editValues.sellingPrice}
                      onChange={(e) => setEditValues({ ...editValues, sellingPrice: e.target.value })}
                      className="w-24"
                    />
                  ) : (
                    `₹${product.sellingPrice}`
                  )}
                </td>
                <td className="text-right p-2">
                  {editingId === product.id ? (
                    <Input
                      type="number"
                      value={editValues.gstRate}
                      onChange={(e) => setEditValues({ ...editValues, gstRate: parseInt(e.target.value) })}
                      className="w-16"
                    />
                  ) : (
                    `${product.gstRate}%`
                  )}
                </td>
                <td className="text-center p-2">
                  {editingId === product.id ? (
                    <Button size="sm" onClick={() => saveEdit(product.id)} data-testid={`button-save-${product.id}`}>
                      Save
                    </Button>
                  ) : (
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(product.id)}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
