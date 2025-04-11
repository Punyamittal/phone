"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface LegendProps {
  title: string;
  gradient: { [key: string]: string };
  isVisible: boolean;
  legendLabels?: string[];
}

export default function HeatMapLegend({ 
  title, 
  gradient, 
  isVisible,
  legendLabels = ["Low", "Medium", "High"] 
}: LegendProps) {
  const [gradientStyle, setGradientStyle] = useState("");
  
  // Convert the gradient object to a CSS linear-gradient string
  useEffect(() => {
    if (!gradient) return;
    
    const sortedKeys = Object.keys(gradient)
      .map(key => parseFloat(key))
      .sort((a, b) => a - b);
    
    const gradientStops = sortedKeys.map(key => {
      return `${gradient[key]} ${key * 100}%`;
    });
    
    setGradientStyle(`linear-gradient(to right, ${gradientStops.join(", ")})`);
  }, [gradient]);

  if (!isVisible) return null;

  return (
    <Card className="absolute bottom-4 right-4 p-3 z-[1000] bg-background/90 backdrop-blur-sm shadow-lg border rounded-md max-w-[200px]">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <div 
          className="h-3 w-full rounded-sm"
          style={{ background: gradientStyle }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {legendLabels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </Card>
  );
} 