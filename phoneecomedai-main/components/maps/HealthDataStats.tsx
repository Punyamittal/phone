"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthHeatPoint } from "./data/healthData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface HealthDataStatsProps {
  dataType: string;
  data: HealthHeatPoint[];
  isVisible: boolean;
}

export default function HealthDataStats({ dataType, data, isVisible }: HealthDataStatsProps) {
  if (!isVisible || !data.length) return null;

  // Calculate statistics based on the data
  const totalPoints = data.length;
  const totalValue = data.reduce((sum, point) => sum + point.value, 0);
  const avgValue = totalValue / totalPoints;
  const maxValue = Math.max(...data.map(point => point.value));
  const minValue = Math.min(...data.map(point => point.value));
  
  // Calculate severity zones
  const highSeverityCount = data.filter(point => point.intensity > 0.7).length;
  const mediumSeverityCount = data.filter(point => point.intensity > 0.4 && point.intensity <= 0.7).length;
  const lowSeverityCount = data.filter(point => point.intensity <= 0.4).length;

  const highSeverityPercentage = (highSeverityCount / totalPoints) * 100;
  
  let description = "";
  let alertType: "default" | "destructive" | null = null;
  
  // Generate description based on data type
  switch(dataType) {
    case 'covid':
      description = `Showing COVID-19 case distribution across the area. ${totalValue.toLocaleString()} total cases reported.`;
      alertType = highSeverityPercentage > 25 ? "destructive" : null;
      break;
    case 'flu':
      description = `Showing flu case distribution across the area. ${totalValue.toLocaleString()} total cases reported.`;
      alertType = highSeverityPercentage > 30 ? "destructive" : null;
      break;
    case 'healthcare_access':
      description = `Showing healthcare accessibility across the area. Average accessibility score: ${avgValue.toFixed(1)} out of 10.`;
      alertType = null;
      break;
    default:
      description = `Health data distribution across the area.`;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Health Data Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {alertType && (
          <Alert variant={alertType}>
            <Info className="h-4 w-4" />
            <AlertTitle>Health Alert</AlertTitle>
            <AlertDescription>
              {dataType === 'covid' && "High concentration of COVID-19 cases detected in some areas."}
              {dataType === 'flu' && "Significant flu activity detected in some areas."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard 
            label="Total Points" 
            value={totalPoints.toLocaleString()} 
          />
          <StatCard 
            label="Average Value" 
            value={avgValue.toFixed(1)} 
          />
          <StatCard 
            label="High Severity Areas" 
            value={`${highSeverityCount} (${highSeverityPercentage.toFixed(1)}%)`} 
          />
          <StatCard 
            label="Coverage Area" 
            value="~15 km²" 
          />
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          <p>This heat map is based on simulated data and is for demonstration purposes only.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-md p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
} 