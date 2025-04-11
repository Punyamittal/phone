import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info, Moon, Sun, Droplet, Sparkles, Activity } from "lucide-react";

interface CycleVisualizerProps {
  cycleLength: number;
  currentDay: number;
  lastPeriodStart: Date | null;
}

interface PhaseInfo {
  name: string;
  description: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  duration: [number, number];
  symptoms: string[];
  selfCare: string[];
  moodTrends: string;
}

const cyclePhases: PhaseInfo[] = [
  {
    name: "Menstrual Phase",
    description: "The uterine lining is shed, resulting in menstrual bleeding",
    color: "rgb(244, 63, 94)",
    gradient: "linear-gradient(135deg, #ff5f6d, #ffc371)",
    icon: <Droplet className="h-6 w-6 text-white" />,
    duration: [1, 5],
    symptoms: ["Cramps", "Fatigue", "Mood changes", "Lower back pain", "Headaches"],
    selfCare: ["Rest when needed", "Stay hydrated", "Use heat therapy for cramps", "Light exercise like yoga"],
    moodTrends: "May experience mood swings, fatigue, or irritability"
  },
  {
    name: "Follicular Phase",
    description: "Follicles in the ovary develop and estrogen levels rise",
    color: "rgb(251, 146, 60)",
    gradient: "linear-gradient(135deg, #fcb045, #fd1d1d)",
    icon: <Sun className="h-6 w-6 text-white" />,
    duration: [6, 13],
    symptoms: ["Increased energy", "Improved mood", "Skin clarity", "Higher motivation", "Creativity boost"],
    selfCare: ["Channel your energy into projects", "Try high-intensity workouts", "Socialize and connect", "Plan important tasks"],
    moodTrends: "Often feel energetic, optimistic, and sociable"
  },
  {
    name: "Ovulation Phase",
    description: "A mature egg is released from the ovary",
    color: "rgb(34, 197, 94)",
    gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
    icon: <Sparkles className="h-6 w-6 text-white" />,
    duration: [14, 16],
    symptoms: ["Mild cramping", "Increased libido", "Clear discharge", "Breast sensitivity", "Heightened senses"],
    selfCare: ["Track fertility signs if trying to conceive/avoid pregnancy", "Stay active", "Focus on connection with partner", "Maintain balanced nutrition"],
    moodTrends: "Typically experience confidence, increased verbal skills, and social energy"
  },
  {
    name: "Luteal Phase",
    description: "The body prepares for possible pregnancy",
    color: "rgb(147, 51, 234)",
    gradient: "linear-gradient(135deg, #8e2de2, #4a00e0)",
    icon: <Moon className="h-6 w-6 text-white" />,
    duration: [17, 28],
    symptoms: ["Breast tenderness", "Bloating", "Mood changes", "Food cravings", "Fatigue", "Acne"],
    selfCare: ["Prioritize self-care", "Reduce caffeine and sugar", "Practice stress management", "Get enough sleep", "Gentle exercise"],
    moodTrends: "May experience PMS symptoms like irritability, anxiety, or emotional sensitivity"
  },
];

export default function CycleVisualizer({
  cycleLength,
  currentDay,
  lastPeriodStart,
}: CycleVisualizerProps) {
  const [selectedPhase, setSelectedPhase] = useState<PhaseInfo | null>(null);
  const [currentPhase, setCurrentPhase] = useState<PhaseInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"symptoms" | "selfCare" | "mood">("symptoms");
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (currentDay) {
      const phase = cyclePhases.find(
        (phase) => currentDay >= phase.duration[0] && currentDay <= phase.duration[1]
      );
      setCurrentPhase(phase || null);
    }
  }, [currentDay]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader 
        className="relative" 
        style={{ 
          background: currentPhase?.gradient || "linear-gradient(135deg, #8b5cf6, #ec4899)",
          padding: "1.5rem" 
        }}
      >
        <CardTitle className="text-white flex items-center justify-between">
          <span>Cycle Phase Visualization</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setShowTips(!showTips)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </CardTitle>
        <motion.div 
          className="absolute top-16 right-4 p-3 bg-white/95 dark:bg-black/80 rounded-lg shadow-lg z-10 max-w-[250px]"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ 
            opacity: showTips ? 1 : 0, 
            y: showTips ? 0 : -10,
            height: showTips ? "auto" : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="text-sm font-medium mb-2">About Your Cycle</h4>
          <p className="text-xs text-muted-foreground">
            Your menstrual cycle is divided into four main phases. Each phase affects your hormones, 
            energy levels, and mood differently. Click on each phase to learn more!
          </p>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="relative h-[320px] w-full">
          {/* Circular visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[280px] h-[280px]">
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0) 50%, rgba(147,51,234,0.2) 100%)",
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
              />
              {cyclePhases.map((phase, index) => {
                const rotation = (index * 360) / cyclePhases.length;
                const isSelected = selectedPhase?.name === phase.name;
                const isActive = currentPhase?.name === phase.name;
                const segmentSize = 90; // 360 / 4 = 90 degrees per segment

                return (
                  <motion.div
                    key={phase.name}
                    className="absolute inset-0"
                    style={{
                      rotate: rotation,
                      transformOrigin: "center",
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 cursor-pointer overflow-hidden"
                      style={{
                        background: `conic-gradient(${phase.gradient} 0deg, ${phase.gradient} ${segmentSize}deg, transparent ${segmentSize}deg)`,
                        opacity: isSelected || isActive ? 1 : 0.7,
                        borderRadius: "50%",
                      }}
                      onClick={() => setSelectedPhase(phase)}
                      whileHover={{ opacity: 0.9 }}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        filter: isActive ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : "none",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Phase icon */}
                    <motion.div
                      className="absolute flex items-center justify-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: phase.gradient,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        // Position the icon at the middle of each segment
                        top: "50%",
                        left: "50%",
                        transform: `rotate(-${rotation}deg) translate(100px, 0px) rotate(${rotation}deg)`,
                      }}
                      animate={{
                        scale: isActive || isSelected ? 1.2 : 1,
                      }}
                    >
                      {phase.icon}
                    </motion.div>
                  </motion.div>
                );
              })}
              {/* Center circle with current day and phase */}
              <motion.div
                className="absolute inset-0 m-auto w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg"
                style={{
                  background: currentPhase?.gradient || "linear-gradient(135deg, #8b5cf6, #ec4899)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">{currentDay}</div>
                  <div className="text-xs">Day</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Phase information with tabs */}
        <AnimatePresence mode="wait">
          {(selectedPhase || currentPhase) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 p-5 rounded-lg"
              style={{ 
                background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.1))",
                borderLeft: `4px solid ${(selectedPhase || currentPhase)?.color}`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
              }}
              key={(selectedPhase || currentPhase)?.name}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full" style={{ background: (selectedPhase || currentPhase)?.gradient }}>
                  {(selectedPhase || currentPhase)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: (selectedPhase || currentPhase)?.color }}>
                    {(selectedPhase || currentPhase)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Days {(selectedPhase || currentPhase)?.duration[0]} - {(selectedPhase || currentPhase)?.duration[1]} of cycle
                  </p>
                </div>
              </div>
              
              <p className="text-sm">
                {(selectedPhase || currentPhase)?.description}
              </p>
              
              {/* Tabs for different information */}
              <div className="flex space-x-1 border-b">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={activeTab === "symptoms" ? "border-b-2 rounded-none" : "rounded-none"}
                  style={{ borderColor: activeTab === "symptoms" ? (selectedPhase || currentPhase)?.color : "transparent" }}
                  onClick={() => setActiveTab("symptoms")}
                >
                  Symptoms
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={activeTab === "selfCare" ? "border-b-2 rounded-none" : "rounded-none"}
                  style={{ borderColor: activeTab === "selfCare" ? (selectedPhase || currentPhase)?.color : "transparent" }}
                  onClick={() => setActiveTab("selfCare")}
                >
                  Self Care
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={activeTab === "mood" ? "border-b-2 rounded-none" : "rounded-none"}
                  style={{ borderColor: activeTab === "mood" ? (selectedPhase || currentPhase)?.color : "transparent" }}
                  onClick={() => setActiveTab("mood")}
                >
                  Mood
                </Button>
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === "symptoms" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="symptoms"
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Common Symptoms:
                    </h4>
                    <ul className="text-sm grid grid-cols-2 gap-2">
                      {(selectedPhase || currentPhase)?.symptoms.map((symptom) => (
                        <li key={symptom} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: (selectedPhase || currentPhase)?.color }}></div>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {activeTab === "selfCare" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="selfCare"
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Recommended Self-Care:
                    </h4>
                    <ul className="text-sm grid grid-cols-1 gap-2">
                      {(selectedPhase || currentPhase)?.selfCare.map((tip) => (
                        <li key={tip} className="flex items-start gap-1.5">
                          <div className="h-2 w-2 rounded-full mt-1.5" style={{ background: (selectedPhase || currentPhase)?.color }}></div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {activeTab === "mood" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="mood"
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Typical Mood Patterns:
                    </h4>
                    <p className="text-sm">
                      {(selectedPhase || currentPhase)?.moodTrends}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 