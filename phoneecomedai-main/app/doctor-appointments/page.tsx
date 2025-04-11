"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Star, Phone, Mail, Video, User, MessageSquare, Filter, Search } from "lucide-react";

export default function DoctorAppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>("in-person");
  
  const doctors = [
    {
      id: "dr-smith",
      name: "Dr. Sarah Smith",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      location: "EchoMed Health Center, Building A",
      availability: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      bio: "Dr. Smith is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and heart rhythm disorders."
    },
    {
      id: "dr-patel",
      name: "Dr. Aisha Patel",
      specialty: "Pulmonologist",
      rating: 4.8,
      reviews: 93,
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      location: "EchoMed Health Center, Building B",
      availability: ["8:30 AM", "11:00 AM", "1:30 PM", "4:00 PM"],
      bio: "Dr. Patel specializes in respiratory medicine with particular expertise in asthma, COPD, and sleep-related breathing disorders. She is committed to helping patients breathe easier."
    },
    {
      id: "dr-johnson",
      name: "Dr. Michael Johnson",
      specialty: "General Practitioner",
      rating: 4.7,
      reviews: 215,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      location: "EchoMed Health Center, Building A",
      availability: ["9:30 AM", "11:30 AM", "2:30 PM", "4:30 PM"],
      bio: "Dr. Johnson is a family physician who provides comprehensive primary care for patients of all ages. He focuses on preventive care and managing chronic conditions."
    },
    {
      id: "dr-rodriguez",
      name: "Dr. Elena Rodriguez",
      specialty: "Neurologist",
      rating: 4.9,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      location: "EchoMed Health Center, Building C",
      availability: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
      bio: "Dr. Rodriguez is a neurologist who specializes in headache disorders, stroke prevention, and neurodegenerative diseases. She takes a holistic approach to neurological health."
    }
  ];
  
  const upcomingAppointments = [
    {
      id: "apt-1",
      doctor: "Dr. Sarah Smith",
      specialty: "Cardiologist",
      date: "May 15, 2025",
      time: "10:30 AM",
      type: "In-person",
      location: "EchoMed Health Center, Building A"
    },
    {
      id: "apt-2",
      doctor: "Dr. Michael Johnson",
      specialty: "General Practitioner",
      date: "June 2, 2025",
      time: "2:30 PM",
      type: "Video Call",
      location: ""
    }
  ];
  
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  const handleBookAppointment = () => {
    // In a real app, this would send the appointment data to a backend
    alert(`Appointment booked with ${doctors.find(d => d.id === selectedDoctor)?.name} on ${format(date!, 'PPP')} at ${selectedTimeSlot}`);
    
    // Reset selection
    setSelectedDoctor(null);
    setSelectedTimeSlot(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Doctor Appointments</h1>
        <p className="text-muted-foreground mb-8">
          Schedule appointments with healthcare professionals
        </p>
      </motion.div>
      
      <Tabs defaultValue="schedule">
        <TabsList className="mb-8">
          <TabsTrigger value="schedule">Schedule Appointment</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="history">Appointment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Find a Doctor</CardTitle>
                  <CardDescription>
                    Search for healthcare professionals by specialty, name, or location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search doctors..." className="pl-9" />
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specialties</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="pulmonology">Pulmonology</SelectItem>
                          <SelectItem value="general">General Practice</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <Card 
                        key={doctor.id} 
                        className={`cursor-pointer transition-all ${selectedDoctor === doctor.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                        onClick={() => handleDoctorSelect(doctor.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={doctor.image} alt={doctor.name} />
                              <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <h3 className="font-medium">{doctor.name}</h3>
                                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                </div>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                  <span className="text-sm font-medium">{doctor.rating}</span>
                                  <span className="text-sm text-muted-foreground ml-1">({doctor.reviews} reviews)</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{doctor.location}</span>
                              </div>
                              {selectedDoctor === doctor.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-4"
                                >
                                  <p className="text-sm mb-3">{doctor.bio}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {doctor.availability.map((time) => (
                                      <Badge 
                                        key={time} 
                                        variant={selectedTimeSlot === time ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTimeSlotSelect(time);
                                        }}
                                      >
                                        {time}
                                      </Badge>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                  <CardDescription>
                    Select date and appointment type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person Visit</SelectItem>
                        <SelectItem value="video">Video Consultation</SelectItem>
                        <SelectItem value="phone">Phone Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Reason for Visit</Label>
                    <Textarea placeholder="Briefly describe your symptoms or reason for the appointment" />
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    disabled={!selectedDoctor || !selectedTimeSlot || !date}
                    onClick={handleBookAppointment}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{appointment.doctor}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        </div>
                        <Badge variant={appointment.type === "Video Call" ? "outline" : "default"}>
                          {appointment.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{appointment.time}</span>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        {appointment.type === "Video Call" ? (
                          <Button className="flex-1">
                            <Video className="h-4 w-4 mr-2" />
                            Join Video Call
                          </Button>
                        ) : (
                          <Button className="flex-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                          Reschedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any upcoming appointments</p>
                  <Button>Schedule an Appointment</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Appointment History</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Dr. Michael Johnson</h3>
                        <p className="text-sm text-muted-foreground">General Practitioner</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>April 10, 2025</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>9:30 AM</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        View Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Doctor
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Dr. Aisha Patel</h3>
                        <p className="text-sm text-muted-foreground">Pulmonologist</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>March 22, 2025</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>1:30 PM</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        View Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Doctor
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Dr. Sarah Smith</h3>
                        <p className="text-sm text-muted-foreground">Cardiologist</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>February 15, 2025</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>10:30 AM</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        View Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Doctor
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}