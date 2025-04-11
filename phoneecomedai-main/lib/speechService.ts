/**
 * Speech Service
 * Provides text-to-speech functionality with voice selection and settings
 */

// Define voice options
export type VoiceGender = 'male' | 'female';
export type VoiceOption = {
  name: string;
  lang: string; 
  gender: VoiceGender;
};

// Voice synthesis state
let isSpeaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let voiceRate = 1.0;
let voicePitch = 1.0;
let voiceVolume = 1.0;

/**
 * Get all available voices, filtered by language
 */
export const getAvailableVoices = (language: string = 'en'): VoiceOption[] => {
  if (typeof window === 'undefined') return [];
  
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  return voices
    .filter(voice => voice.lang.startsWith(language))
    .map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: voice.name.includes('Female') || voice.name.toLowerCase().includes('female') ? 'female' : 'male'
    }));
};

/**
 * Select a voice by name
 */
export const selectVoice = (voiceName: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  selectedVoice = voices.find(voice => voice.name === voiceName) || null;
  
  return selectedVoice !== null;
};

/**
 * Select a default voice based on gender preference
 */
export const selectDefaultVoice = (preferredGender: VoiceGender = 'female'): boolean => {
  if (typeof window === 'undefined') return false;
  
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  // Filter voices by English language first
  const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
  
  // Try to find a voice matching the preferred gender
  const genderPattern = preferredGender === 'female' ? /female|woman/i : /male|man/i;
  const preferredVoice = englishVoices.find(voice => 
    genderPattern.test(voice.name) || 
    (preferredGender === 'female' && voice.name.includes('Google UK English Female')) ||
    (preferredGender === 'male' && voice.name.includes('Google UK English Male'))
  );
  
  // If no gender match, just get any English voice
  selectedVoice = preferredVoice || englishVoices[0] || voices[0] || null;
  
  return selectedVoice !== null;
};

/**
 * Set speech rate (0.1 to 2.0)
 */
export const setSpeechRate = (rate: number): void => {
  voiceRate = Math.max(0.1, Math.min(2.0, rate));
};

/**
 * Set speech pitch (0.1 to 2.0)
 */
export const setSpeechPitch = (pitch: number): void => {
  voicePitch = Math.max(0.1, Math.min(2.0, pitch));
};

/**
 * Set speech volume (0.0 to 1.0)
 */
export const setSpeechVolume = (volume: number): void => {
  voiceVolume = Math.max(0.0, Math.min(1.0, volume));
};

/**
 * Check if speech synthesis is currently speaking
 */
export const isSpeechSynthesisActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return isSpeaking || window.speechSynthesis.speaking;
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (typeof window === 'undefined') return;
  
  const synth = window.speechSynthesis;
  synth.cancel();
  isSpeaking = false;
  currentUtterance = null;
};

/**
 * Speak text using speech synthesis
 * Returns true if speech started successfully
 */
export const speakText = (text: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Stop any current speech
  stopSpeaking();
  
  // Initialize speech synthesis
  const synth = window.speechSynthesis;
  
  // Create utterance with the text
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice and preferences
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  utterance.rate = voiceRate;
  utterance.pitch = voicePitch;
  utterance.volume = voiceVolume;
  
  // Setup event handlers
  utterance.onstart = () => {
    isSpeaking = true;
  };
  
  utterance.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    isSpeaking = false;
    currentUtterance = null;
  };
  
  // Store the current utterance
  currentUtterance = utterance;
  
  // Speak the text
  synth.speak(utterance);
  
  return true;
};

/**
 * Process a long text for speech synthesis by breaking it into sentences
 * This allows for better user experience with longer responses
 */
export const speakLongText = (text: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Split text into sentences for better playback
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Stop any current speech
  stopSpeaking();
  
  // Initialize speech synthesis
  const synth = window.speechSynthesis;
  let currentIndex = 0;
  
  // Function to speak the next sentence
  const speakNextSentence = () => {
    if (currentIndex < sentences.length) {
      const sentence = sentences[currentIndex].trim();
      if (sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        
        // Set voice and preferences
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = voiceRate;
        utterance.pitch = voicePitch;
        utterance.volume = voiceVolume;
        
        // Setup end event to trigger next sentence
        utterance.onend = () => {
          currentIndex++;
          speakNextSentence();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          currentIndex++;
          speakNextSentence();
        };
        
        // Speak the sentence
        synth.speak(utterance);
      } else {
        // Skip empty sentences
        currentIndex++;
        speakNextSentence();
      }
    } else {
      // All sentences spoken
      isSpeaking = false;
    }
  };
  
  // Start speaking the sentences
  isSpeaking = true;
  speakNextSentence();
  
  return true;
};

/**
 * Initialize the speech synthesis system with default voice
 */
export const initSpeechSynthesis = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    const synth = window.speechSynthesis;
    
    // If voices are already loaded
    if (synth.getVoices().length > 0) {
      const success = selectDefaultVoice('female');
      resolve(success);
      return;
    }
    
    // Otherwise wait for voices to be loaded
    const voicesLoaded = () => {
      const success = selectDefaultVoice('female');
      resolve(success);
    };
    
    synth.onvoiceschanged = voicesLoaded;
    
    // Fallback if voices don't load
    setTimeout(() => {
      if (!selectedVoice) {
        const success = selectDefaultVoice('female');
        resolve(success);
      }
    }, 1000);
  });
}; 