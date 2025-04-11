"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Activity,
  Heart,
  Lungs,
  Thermometer,
  AlertCircle,
  ChevronRight,
  Search,
  Plus,
  X,
  Clock,
  BarChart3,
  Zap,
  CheckCircle2,
  History,
  Save,
  Calendar,
  Filter,
  Bookmark,
  Stethoscope,
  User,
  FileText,
  PieChart,
  ArrowUpRight,
  Pill,
  Syringe,
  Virus,
  Bone,
  Droplets,
  Dna,
  Microscope,
  Waves,
  Ear,
  Eye,
  Tooth,
  Smile,
  ArrowLeft,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface Symptom {
  id: string;
  name: string;
  severity: number;
  duration: string;
  category: SymptomCategory;
  description?: string;
  commonCauses?: string[];
  relatedSymptoms?: string[];
  riskLevel?: "low" | "medium" | "high";
  onsetType?: "sudden" | "gradual";
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "variable";
  triggers?: string[];
  relievingFactors?: string[];
  notes?: string;
}

type SymptomCategory = 
  | "neurological"
  | "cardiovascular"
  | "respiratory"
  | "gastrointestinal"
  | "musculoskeletal"
  | "dermatological"
  | "immunological"
  | "endocrine"
  | "urological"
  | "reproductive"
  | "ophthalmological"
  | "otolaryngological"
  | "dental"
  | "psychological"
  | "general";

interface BodySystem {
  id: string;
  name: string;
  icon: React.ReactNode;
  areas: string[];
  description: string;
}

interface SymptomEntry {
  id: string;
  date: Date;
  symptoms: Symptom[];
  analysis: {
    riskLevels: Record<string, number>;
    recommendations: string[];
    urgency: "low" | "medium" | "high";
  };
}

export function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"symptoms" | "analysis" | "history">("symptoms");
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | "all">("all");
  const [symptomHistory, setSymptomHistory] = useState<SymptomEntry[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [filters, setFilters] = useState({
    dateRange: "all",
    categories: [] as SymptomCategory[],
    severity: "all",
  });
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  const commonSymptoms: Symptom[] = [
    // Neurological
    { 
      id: "1", 
      name: "Headache", 
      severity: 0, 
      duration: "", 
      category: "neurological",
      description: "Pain or discomfort in the head or face area",
      commonCauses: ["Stress", "Dehydration", "Eye strain", "Tension"],
      relatedSymptoms: ["Nausea", "Sensitivity to light", "Dizziness"],
      onsetType: "gradual"
    },
    { id: "2", name: "Dizziness", severity: 0, duration: "", category: "neurological" },
    { id: "3", name: "Memory Issues", severity: 0, duration: "", category: "neurological" },
    
    // Cardiovascular
    { 
      id: "4", 
      name: "Chest Pain", 
      severity: 0, 
      duration: "", 
      category: "cardiovascular",
      description: "Discomfort or pain in the chest area",
      commonCauses: ["Angina", "Anxiety", "Muscle strain"],
      riskLevel: "high",
      onsetType: "sudden"
    },
    { id: "5", name: "Palpitations", severity: 0, duration: "", category: "cardiovascular" },
    { id: "6", name: "Shortness of Breath", severity: 0, duration: "", category: "respiratory" },
    
    // Respiratory
    { id: "7", name: "Cough", severity: 0, duration: "", category: "respiratory" },
    { id: "8", name: "Wheezing", severity: 0, duration: "", category: "respiratory" },
    
    // Gastrointestinal
    { id: "9", name: "Nausea", severity: 0, duration: "", category: "gastrointestinal" },
    { id: "10", name: "Abdominal Pain", severity: 0, duration: "", category: "gastrointestinal" },
    
    // Musculoskeletal
    { id: "11", name: "Joint Pain", severity: 0, duration: "", category: "musculoskeletal" },
    { id: "12", name: "Back Pain", severity: 0, duration: "", category: "musculoskeletal" },
    
    // General
    { id: "13", name: "Fatigue", severity: 0, duration: "", category: "general" },
    { id: "14", name: "Fever", severity: 0, duration: "", category: "general" },
  ];

  const bodySystems: BodySystem[] = [
    {
      id: "head",
      name: "Head & Face",
      icon: <Brain className="h-5 w-5" />,
      areas: ["Brain", "Eyes", "Ears", "Nose", "Mouth", "Jaw", "Throat"],
      description: "Head, face, and sensory organs"
    },
    {
      id: "chest",
      name: "Chest & Heart",
      icon: <Heart className="h-5 w-5" />,
      areas: ["Heart", "Lungs", "Ribs", "Breast", "Upper Back"],
      description: "Cardiovascular and respiratory systems"
    },
    {
      id: "abdomen",
      name: "Abdomen & Digestive",
      icon: <Activity className="h-5 w-5" />,
      areas: ["Stomach", "Intestines", "Liver", "Kidneys", "Lower Back"],
      description: "Digestive and urinary systems"
    },
    {
      id: "musculo",
      name: "Muscles & Joints",
      icon: <Activity className="h-5 w-5" />,
      areas: ["Arms", "Legs", "Joints", "Muscles", "Spine"],
      description: "Musculoskeletal system"
    },
    {
      id: "skin",
      name: "Skin & External",
      icon: <Activity className="h-5 w-5" />,
      areas: ["Skin", "Nails", "Hair", "External Injuries"],
      description: "Integumentary system"
    },
    {
      id: "mental",
      name: "Mental & Cognitive",
      icon: <Brain className="h-5 w-5" />,
      areas: ["Mood", "Memory", "Focus", "Sleep", "Behavior"],
      description: "Mental health and cognitive function"
    },
    {
      id: "immune",
      name: "Immune & Systemic",
      icon: <Activity className="h-5 w-5" />,
      areas: ["Immune System", "Allergies", "Infections", "Fatigue"],
      description: "Immune system and whole-body symptoms"
    },
    {
      id: "reproductive",
      name: "Reproductive",
      icon: <Activity className="h-5 w-5" />,
      areas: ["Reproductive Organs", "Urinary System", "Sexual Health"],
      description: "Reproductive and urinary systems"
    }
  ];

  const startAnalysis = () => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setShowResults(true);
          setActiveTab("analysis");
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, { 
        ...symptom, 
        severity: 5, 
        duration: "1-2 days",
        notes: "",
        triggers: [],
        relievingFactors: []
      }]);
    }
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
  };

  const updateSymptomSeverity = (symptomId: string, severity: number) => {
    setSelectedSymptoms(symptoms =>
      symptoms.map(s =>
        s.id === symptomId ? { ...s, severity } : s
      )
    );
  };

  const updateSymptomDuration = (symptomId: string, duration: string) => {
    setSelectedSymptoms(symptoms =>
      symptoms.map(s =>
        s.id === symptomId ? { ...s, duration } : s
      )
    );
  };

  const saveEntry = () => {
    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date(),
      symptoms: selectedSymptoms,
      analysis: {
        riskLevels: bodySystems.reduce((acc, system) => ({
          ...acc,
          [system.id]: system.areas.length
        }), {}),
        recommendations: bodySystems.flatMap(system => system.areas.map(area => \`\${system.name} - \${area}\`)),
        urgency: calculateUrgency(selectedSymptoms)
      }
    };
    
    setSymptomHistory([newEntry, ...symptomHistory]);
    setShowSaveDialog(false);
  };

  const calculateUrgency = (symptoms: Symptom[]): "low" | "medium" | "high" => {
    const hasHighRisk = symptoms.some(s => s.riskLevel === "high");
    const hasMediumRisk = symptoms.some(s => s.riskLevel === "medium");
    if (hasHighRisk) return "high";
    if (hasMediumRisk) return "medium";
    return "low";
  };

  const filteredSymptoms = commonSymptoms.filter(symptom => {
    const matchesSearch = symptom.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || symptom.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNext = () => {
    if (selectedSystem) {
      // Navigate to next step
      console.log("Selected system:", selectedSystem);
    }
  };

  const handleBack = () => {
    // Handle back navigation
    console.log("Going back");
  };

  return (
    <div className="symptom-checker">
      <div className="checker-header">
        <div className="checker-title">
          <div className="title-icon">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary">Symptom Analysis</h1>
            <p className="text-sm text-primary/60">Step 1: Select Area</p>
          </div>
        </div>
      </div>

      <div className="body-systems-grid">
        {bodySystems.map((system) => (
          <button
            key={system.id}
            className={`system-button ${selectedSystem === system.id ? 'selected' : ''}`}
            onClick={() => setSelectedSystem(system.id)}
          >
            <div className="system-icon">{system.icon}</div>
            <div className="system-info">
              <span className="system-name">{system.name}</span>
              <span className="system-description">{system.description}</span>
            </div>
            <div className="system-areas">
              {system.areas.map((area, index) => (
                <span key={index} className="area-tag">{area}</span>
              ))}
            </div>
            {selectedSystem === system.id && (
              <div className="check-icon">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="navigation-buttons">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <button 
          className="next-button" 
          onClick={handleNext}
          disabled={!selectedSystem}
        >
          Next: Select Symptoms
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
} 