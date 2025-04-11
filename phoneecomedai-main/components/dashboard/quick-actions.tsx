import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, PlusCircle, Stethoscope, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      label: "Schedule Appointment",
      icon: Calendar,
      href: "/doctor-appointments",
      color: "text-blue-500",
    },
    {
      label: "Log Symptoms",
      icon: PlusCircle,
      href: "/symptom-tracker/new",
      color: "text-green-500",
    },
    {
      label: "Health Check",
      icon: Stethoscope,
      href: "/symptom-checker",
      color: "text-purple-500",
    },
    {
      label: "Track Vitals",
      icon: Activity,
      href: "/vitals/new",
      color: "text-red-500",
    },
    {
      label: "Chat with AI",
      icon: MessageSquare,
      href: "/ai-assistant",
      color: "text-amber-500",
    },
  ];

  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-4">
          {actions.map((action) => (
            <Link 
              key={action.label} 
              href={action.href}
              className="flex flex-col items-center min-w-[100px] text-center group"
            >
              <Button 
                variant="outline" 
                size="icon" 
                className={cn("h-12 w-12 rounded-full mb-2 group-hover:text-white group-hover:bg-primary transition-colors", 
                  action.color)}
              >
                <action.icon className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 