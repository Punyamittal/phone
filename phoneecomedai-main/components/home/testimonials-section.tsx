"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "EchoMed detected my heart murmur when traditional methods missed it. The AI assistant guided me through the process and helped me understand my condition. I'm incredibly grateful for this technology.",
    author: "Sarah Johnson",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    content: "As a cardiologist in a rural area, EchoMed has transformed how I provide care. My patients can monitor their heart health between visits, and the data helps me make more informed decisions.",
    author: "Dr. Michael Chen",
    role: "Cardiologist",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    content: "The visualization tools in EchoMed have been invaluable for explaining complex heart conditions to my patients. The interactive 3D models and real-time data make abstract concepts tangible.",
    author: "Dr. Emily Rodriguez",
    role: "Pulmonologist",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 4,
    content: "After experiencing unexplained shortness of breath, I used EchoMed to record my lung sounds. The app detected early signs of asthma, which was confirmed by my doctor. Early intervention has made all the difference.",
    author: "James Wilson",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 5,
    content: "In our community health center, EchoMed has allowed us to extend specialized care to underserved populations. The AI-powered diagnostics bridge the gap when specialist access is limited.",
    author: "Dr. Aisha Patel",
    role: "Community Health Director",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  }
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
          <p className="text-muted-foreground text-lg">
            Hear from patients and healthcare providers who have experienced the impact of EchoMed.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <Quote className="h-12 w-12 text-primary/20 mb-6" />
                  
                  <p className="text-xl mb-8 italic">
                    "{testimonials[activeIndex].content}"
                  </p>
                  
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={testimonials[activeIndex].avatar} alt={testimonials[activeIndex].author} />
                    <AvatarFallback>{testimonials[activeIndex].author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold">{testimonials[activeIndex].author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === activeIndex ? "bg-primary" : "bg-primary/20"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -left-12 transform -translate-y-1/2 hidden md:flex"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -right-12 transform -translate-y-1/2 hidden md:flex"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}