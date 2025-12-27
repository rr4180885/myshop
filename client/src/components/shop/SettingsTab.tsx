import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_SETTINGS = {
  shopName: "AutoParts Pro",
  address: "123 Main Road, Sector 15",
  city: "Narnaund, Haryana - 125039",
  phone: "+91 98765 43210",
  email: "info@autopartspro.com",
  gstNumber: "06XXXXX1234X1Z5",
  invoicePrefix: "INV-2024-",
  terms: "Goods once sold cannot be returned. 7 days warranty on all parts.",
};

export default function SettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("shopSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("shopSettings", JSON.stringify(settings));
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  return (
    <div className="max-w-2xl">
      <Card data-testid="card-settings">
        <CardHeader>
          <CardTitle>Shop Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Shop Name</label>
            <Input
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              data-testid="input-shop-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <Input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              data-testid="input-address"
            />
          </div>

          <div>
            <label className="text-sm font-medium">City/State/Pincode</label>
            <Input
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              data-testid="input-city"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              data-testid="input-phone"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">GST Number</label>
            <Input
              value={settings.gstNumber}
              onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
              data-testid="input-gst-number"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Invoice Prefix</label>
            <Input
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
              data-testid="input-invoice-prefix"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Terms & Conditions</label>
            <Textarea
              value={settings.terms}
              onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
              rows={4}
              data-testid="textarea-terms"
            />
          </div>

          <Button onClick={handleSave} data-testid="button-save-settings">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
