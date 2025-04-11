"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Popular health search suggestions
const POPULAR_SUGGESTIONS = [
  "heart health tips",
  "diabetes management",
  "prenatal care",
  "mental health exercises",
  "nutrition basics",
  "medical technology",
  "first aid training",
  "covid-19 updates",
  "women's health",
  "fitness for beginners"
];

// Storage key for recent searches
const RECENT_SEARCHES_KEY = "health-hub-recent-searches";

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save a search query to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase());
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Handle search submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const query = searchText.trim();
    if (query.length > 0) {
      onSearch(query);
      saveRecentSearch(query);
      setShowSuggestions(false);
    }
  };

  // Get filtered suggestions based on current input
  const getFilteredSuggestions = () => {
    const input = searchText.toLowerCase();
    return POPULAR_SUGGESTIONS.filter(suggestion => 
      suggestion.toLowerCase().includes(input)
    ).slice(0, 5);
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSearchText(suggestion);
    onSearch(suggestion);
    saveRecentSearch(suggestion);
    setShowSuggestions(false);
  };

  // Show suggestions when input is focused
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setShowSuggestions(true);
  };

  // Clear the search input
  const clearSearch = () => {
    setSearchText("");
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          
          <Input
            ref={inputRef}
            value={searchText}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search for health videos and courses..."
            className="pl-10 pr-10 py-6 text-base bg-background border-2 shadow-sm focus-visible:ring-primary"
          />
          
          {searchText && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3"
              onClick={clearSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Button type="submit" className="absolute right-0 top-0 h-full rounded-l-none">
          Search
        </Button>
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute mt-1 w-full bg-background border rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <div className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium px-3 py-1 text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${index}`}
                        className="w-full text-left px-3 py-1.5 hover:bg-muted rounded flex items-center justify-between text-sm"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        <span className="truncate">{search}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              <div>
                <h3 className="text-sm font-medium px-3 py-1 text-muted-foreground flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" /> Suggested Topics
                </h3>
                <div className="space-y-1">
                  {getFilteredSuggestions().map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      className="w-full text-left px-3 py-1.5 hover:bg-muted rounded flex items-center justify-between text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="truncate">{suggestion}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 