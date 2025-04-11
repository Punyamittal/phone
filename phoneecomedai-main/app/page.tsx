import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { AccuracyGraph } from '@/components/home/accuracy-graph';
import { AIAssistantDemo } from '@/components/home/ai-assistant-demo';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { GlobalImpactMap } from '@/components/home/global-impact-map';
import { CTASection } from '@/components/home/cta-section';
import { AnimatedHeart } from '@/components/ui/animated-heart';

// Add the animated heart section
function HeartShowcase() {
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-600">
          We Put Heart Into Your Healthcare
        </h2>
        
        <p className="max-w-2xl mx-auto text-muted-foreground mb-12">
          At EchoMed, we're passionate about providing personalized care with empathy and dedication.
          Our AI-powered solutions are designed with heart, to make healthcare more accessible, 
          understandable, and human-centered.
        </p>
        
        <div className="flex flex-wrap justify-center gap-10 items-center">
          <div className="flex flex-col items-center gap-4">
            <AnimatedHeart size={80} color="#ff3366" />
            <span className="text-sm font-medium">Patient Care</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <AnimatedHeart size={100} color="#ff5e94" pulseColor="#ff97ba" />
            <span className="text-sm font-medium">Compassionate AI</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <AnimatedHeart size={120} color="#ff0044" pulseColor="#ff667a" />
            <span className="text-sm font-medium">Trusted Health Partner</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <AnimatedHeart size={80} color="#ff8866" />
            <span className="text-sm font-medium">Community Wellness</span>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-accent/50">
          <p className="text-sm text-muted-foreground">
            Click on the hearts to see them animate! 
            <span className="block mt-1">Our technology is interactive, just like our approach to healthcare.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <HeroSection />
      <FeaturesSection />
      <AccuracyGraph />
      <AIAssistantDemo />
      <GlobalImpactMap />
      <TestimonialsSection />
      <CTASection />
      <HeartShowcase />
    </div>
  );
}