import { MapView } from "@/components/maps/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Thermometer
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function MapsPage() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Map className="h-8 w-8 text-primary" />
          India Healthcare Maps
        </h1>
        <p className="text-muted-foreground">
          Locate hospitals, clinics, and pharmacies across India with health data visualization
        </p>
      </div>
      
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Facility Locator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find healthcare facilities including hospitals, clinics, and pharmacies. View details, get directions, and find contact information.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              Health Heat Maps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Toggle the heat map feature to visualize health data including COVID-19 cases, flu outbreaks, and healthcare accessibility in your area.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Healthcare Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View detailed statistics on health trends and medical facility distribution to make informed healthcare decisions.
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
              placeholder="Search location..." 
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-[200px]">
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Facility Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="clinic">Clinics</SelectItem>
              <SelectItem value="pharmacy">Pharmacies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
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
          <MapView />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    AIIMS New Delhi
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sri Aurobindo Marg, Ansari Nagar, New Delhi
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Hospital className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 11-2658-8500</p>
                <p><span className="font-medium">Hours:</span> Open 24 hours</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Apollo Hospitals
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sarita Vihar, Delhi Mathura Road, New Delhi
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Hospital className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 11-7179-0000</p>
                <p><span className="font-medium">Hours:</span> Open 24 hours</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Fortis Healthcare
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Hospital className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 11-4277-6222</p>
                <p><span className="font-medium">Hours:</span> Open 24 hours</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Moolchand Medcity
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lala Lajpat Rai Marg, Near Defence Colony
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 11-4200-0000</p>
                <p><span className="font-medium">Hours:</span> 9:00 AM - 6:00 PM</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Max Super Speciality Hospital
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    1, 2, Press Enclave Road, Saket
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Hospital className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 11-2651-5050</p>
                <p><span className="font-medium">Hours:</span> Open 24 hours</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Delhi Pharmacy
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connaught Place, New Delhi
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p><span className="font-medium">Phone:</span> +91 93-5678-9012</p>
                <p><span className="font-medium">Hours:</span> 8:00 AM - 10:00 PM</p>
                <p className="mt-2 text-xs text-primary font-medium">Open Now</p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between">
                <Button variant="outline" size="sm">Directions</Button>
                <Button size="sm">Details</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 