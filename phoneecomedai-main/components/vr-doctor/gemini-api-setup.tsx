import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initGeminiApi } from '@/lib/geminiService';
import { ArrowRight, Key } from 'lucide-react';

interface GeminiApiSetupProps {
  onApiKeySet: (isValid: boolean) => void;
}

export default function GeminiApiSetup({ onApiKeySet }: GeminiApiSetupProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);

  // Check for saved API key on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      validateAndSetApiKey(storedApiKey);
    }
  }, []);

  const validateAndSetApiKey = async (key: string) => {
    setIsLoading(true);
    try {
      const isValid = initGeminiApi(key);
      
      if (isValid) {
        localStorage.setItem('gemini_api_key', key);
        setSavedApiKey(key);
        toast.success('Gemini API connected successfully!');
        onApiKeySet(true);
      } else {
        toast.error('Invalid Gemini API key. Please check and try again.');
        onApiKeySet(false);
      }
    } catch (error) {
      console.error('Error initializing Gemini API:', error);
      toast.error('Failed to initialize Gemini API. Please try again.');
      onApiKeySet(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter a Gemini API key');
      return;
    }
    
    validateAndSetApiKey(apiKey);
  };

  const handleReset = () => {
    localStorage.removeItem('gemini_api_key');
    setSavedApiKey(null);
    setApiKey('');
    onApiKeySet(false);
    toast.info('API key removed. Please enter a new key to continue.');
  };

  return (
    <div className="bg-cyan-950/70 backdrop-blur-md border border-cyan-800 rounded-2xl p-6 shadow-xl max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
          <Key className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          {savedApiKey ? 'Gemini API Connected' : 'Connect Gemini AI'}
        </h2>
      </div>
      
      {!savedApiKey ? (
        <>
          <p className="text-cyan-200 mb-4">
            To enable advanced AI features, please enter your Gemini API key. 
            This powers image and speech analysis for better virtual consultation experience.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-cyan-900/50 border-cyan-700 text-white placeholder:text-cyan-400/50"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect to Gemini AI'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-cyan-400">
            <p>Don't have a key? Get one from the <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Google AI Studio</a>.</p>
          </div>
        </>
      ) : (
        <>
          <p className="text-cyan-200 mb-4">
            Gemini AI is successfully connected and ready to provide advanced
            medical analysis during your virtual consultation.
          </p>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full border-cyan-700 text-cyan-400 hover:bg-cyan-900/50"
          >
            Use Different API Key
          </Button>
        </>
      )}
    </div>
  );
} 