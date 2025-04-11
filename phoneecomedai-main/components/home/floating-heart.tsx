"use client";

import { Heart } from "lucide-react";

export function FloatingHeart() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden text-primary/20">
      <div className="absolute top-1/2 left-1/4 animate-float-1 opacity-0">
        <Heart className="w-12 h-12" />
      </div>

      <div className="absolute top-1/3 right-1/4 animate-float-2 opacity-0">
        <Heart className="w-16 h-16" />
      </div>

      <div className="absolute bottom-1/4 left-1/3 animate-float-3 opacity-0">
        <Heart className="w-20 h-20" />
      </div>
    </div>
  );
} 