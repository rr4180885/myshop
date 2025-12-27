import { useState } from "react";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShoppingCart, Boxes, Plus, Settings } from "lucide-react";
import DashboardTab from "@/components/shop/DashboardTab";
import BillingTab from "@/components/shop/BillingTab";
import InventoryTab from "@/components/shop/InventoryTab";
import AddProductTab from "@/components/shop/AddProductTab";
import SettingsTab from "@/components/shop/SettingsTab";

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { mutate: logout } = useLogout();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, component: DashboardTab },
    { id: "billing", label: "Billing", icon: ShoppingCart, component: BillingTab },
    { id: "inventory", label: "Inventory", icon: Boxes, component: InventoryTab },
    { id: "addproduct", label: "Add Product", icon: Plus, component: AddProductTab },
    { id: "settings", label: "Settings", icon: Settings, component: SettingsTab },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activeTabObj?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AutoParts Pro - Shop Management</h1>
          <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="inline w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
}
