"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare } from "lucide-react";

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How accurate is EchoMed's AI diagnosis?",
      answer: "EchoMed's AI has demonstrated 99.2% accuracy for heart sound analysis and 98.5% for lung sound analysis in clinical validation studies. However, accuracy can vary based on recording quality, environmental conditions, and the specific condition being detected. We provide confidence scores with all analyses to indicate the reliability of each result."
    },
    {
      question: "Is my health data secure and private?",
      answer: "Yes, we take data security and privacy extremely seriously. All health data is encrypted end-to-end, and most processing happens directly on your device. When data is transmitted to our servers for advanced analysis, it's fully anonymized and protected according to HIPAA and GDPR standards. You can review our complete privacy policy for more details."
    },
    {
      question: "Can EchoMed replace a visit to my doctor?",
      answer: "No, EchoMed is designed to be a supplementary tool that helps you monitor your health and facilitates conversations with healthcare providers. It is not intended to replace professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment recommendations."
    },
    {
      question: "What smartphones are compatible with EchoMed?",
      answer: "EchoMed is compatible with most modern smartphones running iOS 14+ or Android 9+. The quality of your device's microphone can impact recording quality, but our AI is designed to work with standard smartphone hardware. For optimal results, we recommend using devices manufactured after 2018."
    },
    {
      question: "How often should I record my heart or lung sounds?",
      answer: "The recommended frequency depends on your specific health situation. For general health monitoring, weekly recordings are typically sufficient. If you're monitoring a specific condition or following a healthcare provider's recommendation, you might record more frequently. The app can send you reminders based on your preferred schedule."
    },
    {
      question: "Can I share my EchoMed results with my doctor?",
      answer: "Yes, EchoMed makes it easy to share your results with healthcare providers. You can generate detailed PDF reports that include waveforms, AI analysis results, and historical trends. These can be shared via email, messaging apps, or through our secure healthcare provider portal if your doctor is registered with our system."
    },
    {
      question: "What conditions can EchoMed detect?",
      answer: "EchoMed can detect a range of heart and lung conditions, including but not limited to: heart murmurs, arrhythmias, valve abnormalities, wheezes, crackles, rhonchi, and abnormal breathing patterns. The system provides confidence scores for each detection and can identify patterns that may warrant further medical investigation."
    },
    {
      question: "How does EchoMed compare to traditional stethoscopes?",
      answer: "EchoMed offers several advantages over traditional stethoscopes: it provides objective AI analysis rather than relying solely on the listener's expertise, it creates permanent recordings that can be reviewed and shared, it tracks changes over time, and it's accessible to non-medical users. However, in clinical settings, it's designed to complement rather than replace traditional tools used by healthcare professionals."
    }
  ];
  
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Find answers to common questions about EchoMed's technology and usage
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No matching questions found for "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Card className="border-none bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center md:text-left md:flex-1">
                <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-4">
                  Our support team is ready to help with any questions you may have about EchoMed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button>Contact Support</Button>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}