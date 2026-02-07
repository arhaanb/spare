"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { MenuItem } from "@/lib/types";
import { createMerchant, loginMerchant, BackendAPIError } from "@/lib/api/backend-api";

type TabType = "new" | "returning";
type MenuInputMode = "form" | "json";

export default function OnboardingPage() {
  const router = useRouter();
  const { setMerchantSession } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Onboarding form state
  const [merchantName, setMerchantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [opening, setOpening] = useState("08:00");
  const [closing, setClosing] = useState("20:00");
  const [regularBagPrice, setRegularBagPrice] = useState("150");
  const [largeBagPrice, setLargeBagPrice] = useState("450");
  const [menuInputMode, setMenuInputMode] = useState<MenuInputMode>("form");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuJson, setMenuJson] = useState("");

  // Single menu item form state
  const [currentItem, setCurrentItem] = useState<MenuItem>({
    food_type: "",
    food_name: "",
    non_veg: false,
    price: 0,
    nutritional_value: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const merchant = await loginMerchant({
        email: loginEmail,
        password: loginPassword,
      });
      setMerchantSession(merchant);
      router.push("/");
    } catch (err) {
      if (err instanceof BackendAPIError) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenuItem = () => {
    if (currentItem.food_name && currentItem.food_type && currentItem.price > 0) {
      setMenuItems([...menuItems, currentItem]);
      setCurrentItem({
        food_type: "",
        food_name: "",
        non_veg: false,
        price: 0,
        nutritional_value: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
        },
      });
    }
  };

  const handleRemoveMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(menuJson);
      if (parsed.menu && Array.isArray(parsed.menu)) {
        setMenuItems(parsed.menu);
        setError("");
      } else {
        setError("Invalid JSON format. Expected { menu: [...] }");
      }
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (menuItems.length === 0) {
      setError("Please add at least one menu item");
      return;
    }

    setIsLoading(true);

    try {
      const merchant = await createMerchant({
        merchant_name: merchantName,
        email,
        password,
        location,
        contact: { phone },
        menu: menuItems,
        bag_pricing: {
          regular_bag_price: parseFloat(regularBagPrice),
          large_bag_price: parseFloat(largeBagPrice),
        },
        operating_hours: {
          opening,
          closing,
        },
      });
      setMerchantSession(merchant);
      router.push("/");
    } catch (err) {
      if (err instanceof BackendAPIError) {
        setError(err.message);
      } else {
        setError("Onboarding failed. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spare-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-spare-bg-light border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-pink mb-2">
            Spare Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground font-serif">
            Merchant Portal - Join the fight against food waste
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Tab Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-spare-bg rounded-lg">
            <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 py-3 px-4 rounded-md transition-all font-medium ${
                activeTab === "new"
                  ? "bg-accent text-spare-bg"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              New Merchant
            </button>
            <button
              onClick={() => setActiveTab("returning")}
              className={`flex-1 py-3 px-4 rounded-md transition-all font-medium ${
                activeTab === "returning"
                  ? "bg-accent text-spare-bg"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Returning Merchant
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/20 border border-destructive rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Returning Merchant Form */}
          {activeTab === "returning" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email" className="font-serif text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="bg-spare-bg border-white/10 text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="login-password" className="font-serif text-xs text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-spare-bg border-white/10 text-white pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent-hover text-spare-bg font-semibold"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* New Merchant Form */}
          {activeTab === "new" && (
            <form onSubmit={handleOnboard} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="merchant-name" className="font-serif text-xs text-muted-foreground">
                      Merchant Name *
                    </Label>
                    <Input
                      id="merchant-name"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      required
                      className="bg-spare-bg border-white/10 text-white"
                      placeholder="Baker's Oven"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-serif text-xs text-muted-foreground">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-spare-bg border-white/10 text-white"
                      placeholder="contact@bakersoven.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-serif text-xs text-muted-foreground">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-spare-bg border-white/10 text-white pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-serif text-xs text-muted-foreground">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-spare-bg border-white/10 text-white"
                      placeholder="8920328717"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="font-serif text-xs text-muted-foreground">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-spare-bg border-white/10 text-white"
                    placeholder="123 Main Street, City, State, Pincode"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="opening" className="font-serif text-xs text-muted-foreground">
                      Opening Time *
                    </Label>
                    <Input
                      id="opening"
                      type="time"
                      value={opening}
                      onChange={(e) => setOpening(e.target.value)}
                      required
                      className="bg-spare-bg border-white/10 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="closing" className="font-serif text-xs text-muted-foreground">
                      Closing Time *
                    </Label>
                    <Input
                      id="closing"
                      type="time"
                      value={closing}
                      onChange={(e) => setClosing(e.target.value)}
                      required
                      className="bg-spare-bg border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bag Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Bag Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="regular-price" className="font-serif text-xs text-muted-foreground">
                      Regular Bag Price (₹) *
                    </Label>
                    <Input
                      id="regular-price"
                      type="number"
                      value={regularBagPrice}
                      onChange={(e) => setRegularBagPrice(e.target.value)}
                      required
                      min="0"
                      className="bg-spare-bg border-white/10 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="large-price" className="font-serif text-xs text-muted-foreground">
                      Large Bag Price (₹) *
                    </Label>
                    <Input
                      id="large-price"
                      type="number"
                      value={largeBagPrice}
                      onChange={(e) => setLargeBagPrice(e.target.value)}
                      required
                      min="0"
                      className="bg-spare-bg border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Menu Items</h3>

                {/* Menu Input Mode Toggle */}
                <div className="flex gap-2 p-1 bg-spare-bg rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMenuInputMode("form")}
                    className={`flex-1 py-2 px-3 rounded-md transition-all text-sm ${
                      menuInputMode === "form"
                        ? "bg-accent text-spare-bg"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Form Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuInputMode("json")}
                    className={`flex-1 py-2 px-3 rounded-md transition-all text-sm ${
                      menuInputMode === "json"
                        ? "bg-accent text-spare-bg"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    JSON Paste
                  </button>
                </div>

                {menuInputMode === "form" ? (
                  <div className="space-y-4">
                    <Card className="bg-spare-bg border-white/10 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Food Type</Label>
                          <Input
                            value={currentItem.food_type}
                            onChange={(e) => setCurrentItem({ ...currentItem, food_type: e.target.value })}
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="bakery, snacks, etc."
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Food Name</Label>
                          <Input
                            value={currentItem.food_name}
                            onChange={(e) => setCurrentItem({ ...currentItem, food_name: e.target.value })}
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="Pain Au Chocolate"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Price (₹)</Label>
                          <Input
                            type="number"
                            value={currentItem.price || ""}
                            onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="95"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Non-Veg</Label>
                          <div className="flex items-center h-9">
                            <input
                              type="checkbox"
                              checked={currentItem.non_veg}
                              onChange={(e) => setCurrentItem({ ...currentItem, non_veg: e.target.checked })}
                              className="w-5 h-5 rounded border-white/10 bg-spare-bg-light"
                            />
                            <span className="ml-2 text-sm text-white">Yes</span>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Calories</Label>
                          <Input
                            type="number"
                            value={currentItem.nutritional_value.calories || ""}
                            onChange={(e) =>
                              setCurrentItem({
                                ...currentItem,
                                nutritional_value: {
                                  ...currentItem.nutritional_value,
                                  calories: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="320"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Protein (g)</Label>
                          <Input
                            type="number"
                            value={currentItem.nutritional_value.protein || ""}
                            onChange={(e) =>
                              setCurrentItem({
                                ...currentItem,
                                nutritional_value: {
                                  ...currentItem.nutritional_value,
                                  protein: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="6"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Fat (g)</Label>
                          <Input
                            type="number"
                            value={currentItem.nutritional_value.fat || ""}
                            onChange={(e) =>
                              setCurrentItem({
                                ...currentItem,
                                nutritional_value: {
                                  ...currentItem.nutritional_value,
                                  fat: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="18"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label className="font-serif text-xs text-muted-foreground">Carbs (g)</Label>
                          <Input
                            type="number"
                            value={currentItem.nutritional_value.carbs || ""}
                            onChange={(e) =>
                              setCurrentItem({
                                ...currentItem,
                                nutritional_value: {
                                  ...currentItem.nutritional_value,
                                  carbs: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="bg-spare-bg-light border-white/10 text-white"
                            placeholder="34"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddMenuItem}
                        className="mt-4 w-full bg-accent hover:bg-accent-hover text-spare-bg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      value={menuJson}
                      onChange={(e) => setMenuJson(e.target.value)}
                      className="bg-spare-bg border-white/10 text-white min-h-[200px] font-mono text-sm"
                      placeholder='{"menu": [{"food_type": "bakery", "food_name": "Pain Au Chocolate", "non_veg": false, "price": 95, "nutritional_value": {"calories": 320, "protein": 6, "fat": 18, "carbs": 34}}]}'
                    />
                    <Button
                      type="button"
                      onClick={handleParseJson}
                      className="w-full bg-accent hover:bg-accent-hover text-spare-bg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Parse JSON
                    </Button>
                  </div>
                )}

                {/* Display Menu Items */}
                {menuItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-serif text-muted-foreground">
                      {menuItems.length} item(s) added
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {menuItems.map((item, index) => (
                        <Card key={index} className="bg-spare-bg border-white/10 p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-white">{item.food_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.food_type} • ₹{item.price}
                                {item.non_veg && " • Non-Veg"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMenuItem(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || menuItems.length === 0}
                className="w-full bg-pink hover:bg-pink-hover text-white font-semibold py-6 text-lg"
              >
                {isLoading ? "Creating Account..." : "Complete Onboarding"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
