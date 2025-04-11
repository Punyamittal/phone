"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GlobalImpactMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = svgRef.current.clientWidth;
    const height = 400;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g");
    
    // Define projection
    const projection = d3.geoMercator()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    
    // Define path generator
    const path = d3.geoPath().projection(projection);
    
    // Load world map data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((data: any) => {
        // Draw map
        svg.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", "hsl(var(--muted))")
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 0.5);
        
        // Sample data for impact points
        const impactPoints = [
          { name: "New York", coordinates: [-74, 40.7], users: 120000, radius: 15 },
          { name: "London", coordinates: [0, 51.5], users: 95000, radius: 14 },
          { name: "Tokyo", coordinates: [139.7, 35.7], users: 85000, radius: 13 },
          { name: "Mumbai", coordinates: [72.8, 19.1], users: 70000, radius: 12 },
          { name: "São Paulo", coordinates: [-46.6, -23.5], users: 65000, radius: 12 },
          { name: "Lagos", coordinates: [3.4, 6.5], users: 50000, radius: 11 },
          { name: "Cairo", coordinates: [31.2, 30.0], users: 45000, radius: 10 },
          { name: "Sydney", coordinates: [151.2, -33.9], users: 40000, radius: 10 },
          { name: "Berlin", coordinates: [13.4, 52.5], users: 35000, radius: 9 },
          { name: "Mexico City", coordinates: [-99.1, 19.4], users: 30000, radius: 9 },
        ];
        
        // Add impact points
        svg.selectAll("circle")
          .data(impactPoints)
          .enter()
          .append("circle")
          .attr("cx", d => projection(d.coordinates as [number, number])![0])
          .attr("cy", d => projection(d.coordinates as [number, number])![1])
          .attr("r", d => 0)
          .attr("fill", "hsl(var(--primary))")
          .attr("opacity", 0.7)
          .transition()
          .duration(1000)
          .delay((d, i) => i * 200)
          .attr("r", d => d.radius);
        
        // Add pulse effect
        svg.selectAll(".pulse")
          .data(impactPoints)
          .enter()
          .append("circle")
          .attr("class", "pulse")
          .attr("cx", d => projection(d.coordinates as [number, number])![0])
          .attr("cy", d => projection(d.coordinates as [number, number])![1])
          .attr("r", d => d.radius)
          .attr("fill", "none")
          .attr("stroke", "hsl(var(--primary))")
          .attr("stroke-width", 2)
          .attr("opacity", 1)
          .style("pointer-events", "none")
          .transition()
          .duration(2000)
          .attr("r", d => d.radius * 2)
          .attr("opacity", 0)
          .on("end", function(d, i) {
            d3.select(this)
              .attr("r", d.radius)
              .attr("opacity", 1)
              .transition()
              .duration(2000)
              .attr("r", d.radius * 2)
              .attr("opacity", 0)
              .on("end", function() {
                d3.select(this).call(repeat as any);
              });
          });
        
        function repeat(this: any, d: any) {
          d3.select(this)
            .attr("r", d.radius)
            .attr("opacity", 1)
            .transition()
            .duration(2000)
            .attr("r", d.radius * 2)
            .attr("opacity", 0)
            .on("end", function() {
              d3.select(this).call(repeat as any);
            });
        }
      });
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Global Impact</CardTitle>
              <CardDescription className="text-lg">
                EchoMed is improving healthcare access in over 120 countries worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <svg ref={svgRef} width="100%" height="400" />
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-primary">2.4M+</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Countries</p>
                  <p className="text-3xl font-bold">120+</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Diagnoses</p>
                  <p className="text-3xl font-bold">18.7M+</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Lives Improved</p>
                  <p className="text-3xl font-bold">5.2M+</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}