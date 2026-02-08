"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FoodItemCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function FoodItemCounter({
  value,
  onChange,
  min = 0,
  max,
  className = "",
}: FoodItemCounterProps) {
  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      if (max !== undefined) {
        onChange(Math.min(Math.max(newValue, min), max));
      } else {
        onChange(Math.max(newValue, min));
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-11 w-11 rounded-md border-white/10 hover:bg-accent hover:text-spare-bg transition-colors"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-20 text-center bg-spare-bg border-white/10 text-white font-semibold text-lg h-11"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="h-11 w-11 rounded-md border-white/10 hover:bg-accent hover:text-spare-bg transition-colors"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
