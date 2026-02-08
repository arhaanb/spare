"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ImageUploader";
import { FoodItemCounter } from "@/components/FoodItemCounter";
import { useAuth } from "@/components/AuthProvider";
import { extractFoodFromImage, createRescueBags } from "@/lib/api/ml-api";
import { saveLeftoverItems, saveRescueBags, BackendAPIError } from "@/lib/api/backend-api";
import {
  ExtractedFoodItem,
  RescueBagSuggestion,
  BagType,
} from "@/lib/types";
import { Loader2, Plus, Trash2, CheckCircle2, Sparkles, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FlowStep = "upload" | "extract" | "edit" | "bags" | "summary";

export default function RescueFlowPage() {
  const router = useRouter();
  const { user, merchant } = useAuth();
  const [step, setStep] = useState<FlowStep>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState("");

  // Extracted items state
  const [extractedItems, setExtractedItems] = useState<ExtractedFoodItem[]>([]);
  const [editableItems, setEditableItems] = useState<ExtractedFoodItem[]>([]);

  // Rescue bags state
  const [suggestedBags, setSuggestedBags] = useState<RescueBagSuggestion[]>([]);
  
  // Summary modal
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalBags: number;
    bagsByType: Record<BagType, number>;
  } | null>(null);

  const handleImageSelect = (base64: string, file: File) => {
    setImageBase64(base64);
    setImageFile(file);
    setError("");
  };

  const handleExtractFood = async () => {
    if (!imageBase64 || !user) {
      setError("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await extractFoodFromImage(user.merchantId, imageBase64);
      setExtractedItems(response.items);
      setEditableItems(response.items);
      setStep("edit");
    } catch (err: any) {
      setError(err.message || "Failed to extract food items");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], quantity };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    const newItem: ExtractedFoodItem = {
      type: "",
      quantity: 1,
      closest_menu_item: "Custom Item",
      confidence: 100,
      price: 0,
      non_veg: false,
    };
    setEditableItems([...editableItems, newItem]);
  };

  const handleUpdateItemField = (
    index: number,
    field: keyof ExtractedFoodItem,
    value: any
  ) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleConfirmItems = async () => {
    if (!user || editableItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().split("T")[0];

      await saveLeftoverItems({
        merchant_id: user.merchantId,
        date: today,
        items: editableItems,
      });

      setStep("bags");
    } catch (err) {
      if (err instanceof BackendAPIError) {
        setError(err.message);
      } else {
        setError("Failed to save items");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestBags = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await createRescueBags(user.merchantId);
      setSuggestedBags(response.bags);
    } catch (err: any) {
      setError(err.message || "Failed to create rescue bags");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBags = async () => {
    if (!user || suggestedBags.length === 0) {
      setError("No bags to confirm");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().split("T")[0];

      await saveRescueBags({
        merchant_id: user.merchantId,
        date: today,
        bags: suggestedBags,
      });

      // Calculate summary
      const bagsByType: Record<BagType, number> = {
        regular_veg: 0,
        regular_non_veg: 0,
        large_veg: 0,
        large_non_veg: 0,
      };

      suggestedBags.forEach((bag) => {
        bagsByType[bag.bag_type] = (bagsByType[bag.bag_type] || 0) + 1;
      });

      setSummaryData({
        totalBags: suggestedBags.length,
        bagsByType,
      });

      setShowSummary(true);
    } catch (err) {
      if (err instanceof BackendAPIError) {
        setError(err.message);
      } else {
        setError("Failed to save rescue bags");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBagTypeColor = (bagType: BagType) => {
    if (bagType.includes("veg") && !bagType.includes("non")) {
      return "bg-accent/20 text-accent border-accent/30";
    }
    return "bg-pink/20 text-pink border-pink/30";
  };

  const getBagTypeLabel = (bagType: BagType) => {
    return bagType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <Header
        title="Upload & Extract"
        subtitle="Upload food images and create rescue bags"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {error && (
          <div className="p-4 bg-destructive/20 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Image Upload */}
        {step === "upload" && (
          <Card className="bg-spare-bg-light border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Step 1: Upload Image</CardTitle>
              <p className="text-sm text-muted-foreground font-serif">
                Take a photo or upload an image of your leftover food items
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                onImageSelect={handleImageSelect}
                onClear={() => {
                  setImageBase64("");
                  setImageFile(null);
                }}
              />

              {imageBase64 && (
                <Button
                  onClick={handleExtractFood}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-spare-bg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Food Items
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Edit Extracted Items */}
        {step === "edit" && (
          <Card className="bg-spare-bg-light border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Step 2: Review & Edit Items</CardTitle>
              <p className="text-sm text-muted-foreground font-serif">
                Verify extracted items and adjust quantities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editableItems.map((item, index) => (
                  <Card key={index} className="bg-spare-bg border-white/10 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Input
                            value={item.closest_menu_item}
                            onChange={(e) =>
                              handleUpdateItemField(index, "closest_menu_item", e.target.value)
                            }
                            className="bg-spare-bg-light border-white/10 text-white font-semibold mb-2"
                          />
                          <div className="flex gap-2 items-center">
                            <Badge
                              className={
                                item.non_veg
                                  ? "bg-pink/20 text-pink border-0 text-xs"
                                  : "bg-accent/20 text-accent border-0 text-xs"
                              }
                            >
                              {item.non_veg ? "Non-Veg" : "Veg"}
                            </Badge>
                            <span className="text-xs text-accent">₹{item.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground font-serif mb-2 block">
                          Quantity
                        </Label>
                        <FoodItemCounter
                          value={item.quantity}
                          onChange={(value) => handleUpdateItemQuantity(index, value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleAddItem}
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep("upload")}
                  variant="outline"
                  className="flex-1 sm:flex-none border-white/20"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmItems}
                  disabled={isLoading || editableItems.length === 0}
                  className="flex-1 bg-accent hover:bg-accent-hover text-spare-bg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Items
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Suggest Rescue Bags */}
        {step === "bags" && (
          <div className="space-y-6">
            {suggestedBags.length === 0 ? (
              <Card className="bg-spare-bg-light border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Step 3: Create Rescue Bags</CardTitle>
                  <p className="text-sm text-muted-foreground font-serif">
                    Generate optimized rescue bags from your leftover items
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleSuggestBags}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-pink hover:bg-pink-hover text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Bags...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Suggest Rescue Bags
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-spare-bg-light border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Suggested Rescue Bags</CardTitle>
                    <p className="text-sm text-muted-foreground font-serif">
                      {suggestedBags.length} bag(s) created based on your leftover items
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestedBags.map((bag, index) => (
                        <Card key={index} className="bg-spare-bg border-white/10 p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className={getBagTypeColor(bag.bag_type)}>
                                {getBagTypeLabel(bag.bag_type)}
                              </Badge>
                              <span className="text-lg font-bold text-accent">
                                ₹{bag.target_price}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground font-serif">Items:</p>
                              {bag.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex justify-between text-sm border-b border-white/5 pb-1"
                                >
                                  <span className="text-white">
                                    {item.food_name} x{item.quantity}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ₹{item.unit_price}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-white/10">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-serif">
                                  Total Value:
                                </span>
                                <span className="text-white font-semibold">
                                  ₹{bag.estimated_total_value}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button
                        onClick={() => {
                          setSuggestedBags([]);
                          setStep("edit");
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none border-white/20"
                      >
                        Back to Items
                      </Button>
                      <Button
                        onClick={handleConfirmBags}
                        disabled={isLoading}
                        className="flex-1 bg-pink hover:bg-pink-hover text-white font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Bags
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>

      {/* Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="bg-spare-bg-light border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-pink">Success!</DialogTitle>
            <DialogDescription className="text-muted-foreground font-serif">
              Your rescue bags have been created and saved
            </DialogDescription>
          </DialogHeader>

          {summaryData && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent mb-2">
                  {summaryData.totalBags}
                </p>
                <p className="text-sm text-muted-foreground font-serif">
                  Total Rescue Bags Created
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(summaryData.bagsByType).map(([type, count]) => {
                  if (count === 0) return null;
                  return (
                    <Card key={type} className="bg-spare-bg border-white/10 p-3 text-center">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        {getBagTypeLabel(type as BagType)}
                      </p>
                    </Card>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setShowSummary(false);
                  router.push("/");
                }}
                className="w-full bg-accent hover:bg-accent-hover text-spare-bg font-semibold"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
