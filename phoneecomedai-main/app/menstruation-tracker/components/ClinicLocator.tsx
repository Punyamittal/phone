import { useState } from "react";
import { MapView } from "@/components/maps/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Hospital, 
  Stethoscope, 
  PlusCircle,
  Search, 
  Map,
  Thermometer,
  Heart,
  Clock,
  Star,
  Phone
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Clinic {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  address: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  rating: number;
  specialties: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

const mockClinics: Clinic[] = [
  {
    id: "1",
    name: "Women's Health Center",
    type: "clinic",
    address: "123 Healthcare Ave, Medical District",
    phone: "+91 98-7654-3210",
    hours: "9:00 AM - 6:00 PM",
    isOpen: true,
    rating: 4.8,
    specialties: ["Gynecology", "Obstetrics", "Fertility"],
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  // Add more mock clinics as needed
];

export default function ClinicLocator() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [facilityType, setFacilityType] = useState("all");
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hospital className="h-5 w-5 text-primary" />
              Find Women's Health Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Locate specialized women's health clinics, gynecologists, and fertility centers near you.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              Health Service Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View heat maps showing the distribution and accessibility of women's healthcare services.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Specialized Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find specialists in menstrual health, fertility treatments, and women's wellness.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[260px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search clinics or locations..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-[200px]">
          <Select value={facilityType} onValueChange={setFacilityType}>
            <SelectTrigger>
              <SelectValue placeholder="Facility Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="clinic">Women's Clinics</SelectItem>
              <SelectItem value="pharmacy">Pharmacies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHeatmap(!showHeatmap)}>
            <Thermometer className="mr-2 h-4 w-4" />
            {showHeatmap ? "Hide" : "Show"} Heat Map
          </Button>
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Find Nearby
          </Button>
        </div>
      </div>

      <Tabs defaultValue="map">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <div className="rounded-lg overflow-hidden border h-[600px] relative">
            <MapView />
            {selectedClinic && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{selectedClinic.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedClinic.address}</p>
                  </div>
                  <Badge variant={selectedClinic.isOpen ? "success" : "secondary"}>
                    {selectedClinic.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {selectedClinic.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {selectedClinic.hours}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedClinic.phone}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">Get Directions</Button>
                  <Button size="sm">Book Appointment</Button>
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {mockClinics.map((clinic) => (
              <motion.div
                key={clinic.id}
                whileHover={{ scale: 1.02 }}
                className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{clinic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{clinic.address}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2">
                    {clinic.type === "hospital" ? (
                      <Hospital className="h-5 w-5 text-primary" />
                    ) : clinic.type === "clinic" ? (
                      <Stethoscope className="h-5 w-5 text-primary" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{clinic.rating}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {clinic.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Book Now</Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 