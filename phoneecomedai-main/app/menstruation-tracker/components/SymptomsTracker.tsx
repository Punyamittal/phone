import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Zap, Droplet, Plus, Brain, Coffee, Frown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SymptomsTrackerProps {
  onSymptomsChange: (symptoms: string[]) => void;
  selectedSymptoms: string[];
}

interface SymptomCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  symptoms: string[];
}

const symptomCategories: SymptomCategory[] = [
  {
    name: "Pain",
    icon: <Zap className="h-4 w-4" />,
    color: "text-red-500 dark:text-red-400",
    symptoms: ["Cramps", "Headache", "Back Pain", "Breast Tenderness"]
  },
  {
    name: "Physical",
    icon: <Thermometer className="h-4 w-4" />,
    color: "text-orange-500 dark:text-orange-400",
    symptoms: ["Bloating", "Fatigue", "Nausea", "Acne", "Constipation", "Diarrhea"]
  },
  {
    name: "Mood",
    icon: <Brain className="h-4 w-4" />,
    color: "text-purple-500 dark:text-purple-400",
    symptoms: ["Mood Swings", "Anxiety", "Irritability", "Depression", "Motivation Loss"]
  },
  {
    name: "Cravings",
    icon: <Coffee className="h-4 w-4" />,
    color: "text-amber-500 dark:text-amber-400",
    symptoms: ["Food Cravings", "Sweet Cravings", "Salt Cravings", "Loss of Appetite"]
  }
];

// Get all symptoms from categories
const allSymptoms = symptomCategories.flatMap(cat => cat.symptoms);

export default function SymptomsTracker({
  onSymptomsChange,
  selectedSymptoms,
}: SymptomsTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSymptomToggle = (symptom: string) => {
    const updatedSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    onSymptomsChange(updatedSymptoms);
  };

  // Filter symptoms based on search
  const getFilteredSymptoms = () => {
    if (!searchTerm && !activeCategory) return allSymptoms;
    
    let filteredSymptoms = allSymptoms;
    
    if (activeCategory) {
      const category = symptomCategories.find(c => c.name === activeCategory);
      filteredSymptoms = category ? category.symptoms : filteredSymptoms;
    }
    
    if (searchTerm) {
      filteredSymptoms = filteredSymptoms.filter(symptom => 
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredSymptoms;
  };

  return (
    <Card className="border-pink-200 dark:border-pink-900">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          Symptoms Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search symptoms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-pink-200 dark:border-pink-800"
            />
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {symptomCategories.map((category) => (
              <Badge
                key={category.name}
                variant={activeCategory === category.name ? "default" : "secondary"}
                className={`cursor-pointer ${
                  activeCategory === category.name 
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
                    : "hover:bg-pink-100 dark:hover:bg-pink-900/50"
                }`}
                onClick={() => {
                  if (activeCategory === category.name) {
                    setActiveCategory(null);
                  } else {
                    setActiveCategory(category.name);
                  }
                }}
              >
                <span className={activeCategory === category.name ? "" : category.color}>
                  {category.icon}
                </span>
                <span className="ml-1">{category.name}</span>
              </Badge>
            ))}
            
            {(activeCategory || searchTerm) && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => {
                  setActiveCategory(null);
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Badge>
            )}
          </div>
          
          {/* Selected symptoms */}
          {selectedSymptoms.length > 0 && (
            <div className="border-t border-b py-2 border-pink-100 dark:border-pink-900/50">
              <p className="text-xs text-muted-foreground mb-2">Selected symptoms:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSymptoms.map(symptom => {
                  // Find which category this symptom belongs to
                  const category = symptomCategories.find(c => 
                    c.symptoms.includes(symptom)
                  );
                  
                  return (
                    <motion.div
                      key={symptom}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Badge 
                        variant="secondary"
                        className="px-2 py-1 gap-1 cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900/70"
                        onClick={() => handleSymptomToggle(symptom)}
                      >
                        <span className={category?.color}>
                          {category?.icon}
                        </span>
                        {symptom}
                        <Frown className="h-3 w-3 ml-1" />
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Symptoms grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {getFilteredSymptoms().map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              // Find which category this symptom belongs to
              const category = symptomCategories.find(c => 
                c.symptoms.includes(symptom)
              );
              
              return (
                <motion.div 
                  key={symptom} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className={`
                      flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors
                      ${isSelected 
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/50 dark:to-purple-950/50 border border-pink-200 dark:border-pink-800' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}
                    `}
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    <Checkbox
                      id={symptom}
                      checked={isSelected}
                      onCheckedChange={() => {}}
                      className={`${isSelected ? 'text-pink-500 border-pink-500' : ''}`}
                    />
                    <Label 
                      htmlFor={symptom}
                      className="cursor-pointer flex items-center gap-1.5 text-sm"
                    >
                      {isSelected && (
                        <span className={category?.color}>
                          {category?.icon}
                        </span>
                      )}
                      {symptom}
                    </Label>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Add custom symptom button */}
          <motion.div 
            className="flex justify-center mt-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button 
              onClick={() => {
                const custom = prompt("Enter your custom symptom:");
                if (custom && custom.trim() && !selectedSymptoms.includes(custom.trim())) {
                  onSymptomsChange([...selectedSymptoms, custom.trim()]);
                }
              }}
              className="text-sm flex items-center gap-1 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
            >
              <Plus className="h-4 w-4" />
              Add custom symptom
            </button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
} 