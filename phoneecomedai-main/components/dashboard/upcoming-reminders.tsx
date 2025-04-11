"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Bell, Clock, Pill, Calendar, Heart, Plus } from "lucide-react";

export function UpcomingReminders() {
  const reminders = [
    {
      id: 1,
      title: "Take Blood Pressure Medication",
      time: "Today, 8:00 PM",
      icon: Pill,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 2,
      title: "Record Heart Sounds",
      time: "Tomorrow, 9:00 AM",
      icon: Heart,
      iconColor: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      id: 3,
      title: "Doctor's Appointment",
      time: "Friday, 2:30 PM",
      icon: Calendar,
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Upcoming Reminders</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Never miss important health activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full ${reminder.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <reminder.icon className={`h-5 w-5 ${reminder.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reminder.title}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{reminder.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      Snooze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}