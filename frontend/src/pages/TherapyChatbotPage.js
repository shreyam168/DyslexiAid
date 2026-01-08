import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Main container
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.large};
  font-family: ${props => props.theme.fonts.primary};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  
  @media (max-height: 700px) {
    padding: ${props => props.theme.spacing.medium};
  }
`;

const PageHeader = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.large};
  text-align: center;
  
  @media (max-height: 700px) {
    font-size: 2rem;
    margin-bottom: ${props => props.theme.spacing.small};
  }
`;

const PageFeatureImage = styled.img`
  display: block;
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin: 0 auto ${props => props.theme.spacing.large} auto;
`;

// Controls section at the top
const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.tile};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.shadow};
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.small};
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.small};
  font-size: 1rem;
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.colors.highlight};
  background-color: ${props => props.theme.colors.secondary};
  min-width: 200px;
`;

const SpeedBar = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${props => props.theme.spacing.small};
`;

const SliderTrack = styled.div`
  position: relative;
  height: 4px;
  background-color: #E0D9D1;
  border-radius: 4px;
  flex-grow: 1;
  margin: 0 8px;
`;

const SliderProgressTrack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => ((props.value - 0.25) / 1.75) * 100}%;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 4px;
  transition: width 0.2s;
`;

const SliderMarkers = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 6px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
`;

const SliderMarker = styled.div`
  position: relative;
  width: 12px;
  height: 12px;
  background-color: ${props => props.active ? props.theme.colors.primary : '#E0D9D1'};
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: -6px;
  z-index: 2;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary};
  }
`;

const SliderInput = styled.input`
  position: absolute;
  top: -8px;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 8px;
  padding: 0 ${props => props.theme.spacing.small};
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const SliderLabel = styled.div`
  text-align: center;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

// Chat section (main content)
const ChatSection = styled.section`
  background-color: ${props => props.theme.colors.tile};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.large};
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 400px;
`;

// Media controls for the player
const MediaControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.medium};
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const MediaButton = styled.button`
  background: none;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.disabled ? props.theme.colors.highlight : (props.active ? props.theme.colors.primary : props.theme.colors.text)};
  font-size: 1.5rem;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : props.theme.colors.highlight + '20'};
  }
`;

const ConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
  overflow-y: auto;
  padding: ${props => props.theme.spacing.small};
  flex-grow: 1;
  height: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.secondary};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.highlight};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

// Modify MessageBubble to allow for controls inside it
const MessageBubble = styled.div`
  max-width: 85%;
  padding: ${props => props.theme.spacing.medium};
  border-radius: 12px;
  font-size: 1.1rem;
  line-height: 1.6;
  position: relative;
  margin-bottom: ${props => props.theme.spacing.small};
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: ${props.theme.colors.primary};
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background-color: ${props.theme.colors.secondary};
    color: ${props.theme.colors.text};
    border-bottom-left-radius: 4px;
  `}
`;

// Add a component for message controls
const MessageControls = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-self: flex-end;
`;

const Word = styled.span`
  display: inline-block;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &.highlighted {
    background-color: #90ee90;
    color: ${props => props.theme.colors.primary};
  }
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
  margin-top: auto;
  padding-top: ${props => props.theme.spacing.medium};
`;

const InputField = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.medium};
  font-size: 1.1rem;
  border: 1px solid ${props => props.theme.colors.highlight};
  border-radius: ${props => props.theme.borderRadius};
  background-color: ${props => props.theme.colors.secondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.medium};
  margin-top: ${props => props.theme.spacing.small};
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.large};
  background-color: ${props => props.theme.colors.button};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  min-width: 120px;

  &:hover {
    background-color: ${props => props.theme.colors.primary};
    color: white;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ResponseImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: ${props => props.theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const LoadingDots = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: ${props => props.theme.colors.text};
    border-radius: 50%;
    animation: bounce 1.5s infinite ease-in-out;
  }
  
  .dot:nth-child(1) { animation-delay: 0s; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const ListeningIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 1rem;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ff5252;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.5; }
    100% { transform: scale(0.95); opacity: 1; }
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 1rem;
  margin-top: ${props => props.theme.spacing.small};
  text-align: center;
`;

// SVG Icons
const SpeakerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z"/>
  </svg>
);

// Add the new person icons
const WalkingPersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
  </svg>
);

const RunningPersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </svg>
);

// Update the existing SpeedBar component
const SliderEndIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  color: ${props => props.theme.colors.text};
`;

// Message type for conversation
const MessageType = {
  USER: 'user',
  AI: 'ai',
  LOADING: 'loading'
};

const TherapyChatbotPage = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([
    { type: MessageType.AI, text: "Hi there! I'm your Best Buddy. I'm here to help you with your therapy needs. How are you feeling today?" }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [currentWord, setCurrentWord] = useState({ messageId: null, wordIndex: null });
  
  const conversationRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef({
    utterance: null,
    messageId: null,
    text: '',
    currentIndex: 0,
    processedText: [],
    wordIndices: []
  });
  
  // Initialize speech recognition and voices
  useEffect(() => {
    // Speech recognition initialization
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        // Auto-submit when using voice
        if (transcript.trim()) {
          handleSubmitWithQuery(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('Speech recognition error. Please try again.');
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    // Initialize voices for text-to-speech
    const synth = window.speechSynthesis;
    
    const populateVoices = () => {
      const availableVoices = synth.getVoices();
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.includes('en') || voice.lang.includes('EN')
      );
      setVoices(englishVoices);
      
      if (englishVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(englishVoices[0]);
      }
    };
    
    populateVoices();
    
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoices;
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error aborting speech recognition:', err);
        }
      }
      
      // Cancel any ongoing speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);
  
  // Tokenize text into words and spaces
  const tokenizeText = (text) => {
    if (!text) return [];
    
    const tokens = [];
    let wordBuffer = '';
    let spaceBuffer = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.trim() === '') {
        if (wordBuffer) {
          tokens.push({ type: 'word', value: wordBuffer });
          wordBuffer = '';
        }
        spaceBuffer += char;
      } else {
        if (spaceBuffer) {
          tokens.push({ type: 'space', value: spaceBuffer });
          spaceBuffer = '';
        }
        wordBuffer += char;
      }
    }
    
    if (wordBuffer) tokens.push({ type: 'word', value: wordBuffer });
    if (spaceBuffer) tokens.push({ type: 'space', value: spaceBuffer });
    
    return tokens;
  };
  
  // Process message for speech synthesis with word highlighting
  const processMessageForSpeech = (text) => {
    const tokens = tokenizeText(text);
    const wordIndices = [];
    let charIndex = 0;
    
    tokens.forEach((token, index) => {
      if (token.type === 'word') {
        wordIndices.push({
          index,
          word: token.value,
          start: charIndex,
          end: charIndex + token.value.length
        });
      }
      charIndex += token.value.length;
    });
    
    return { tokens, wordIndices };
  };
  
  // Function to start reading text - update to accept a specific messageId
  const startSpeaking = (messageId) => {
    // Find the specific AI message by ID
    const message = conversation[messageId];
    
    if (!message || message.type !== MessageType.AI) return;
    
    const text = message.text;
    
    if (!window.speechSynthesis || !text) {
      setError('Text-to-speech is not supported in your browser or no text to read.');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Process the text for speech
    const { tokens, wordIndices } = processMessageForSpeech(text);
    
    speechSynthesisRef.current = {
      utterance: null,
      messageId,
      text,
      currentIndex: 0,
      processedText: tokens,
      wordIndices
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    
    // Set up word boundary detection for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex || 0;
        
        // Find the word at this character position
        const wordObj = wordIndices.find(
          word => charIndex >= word.start && charIndex < word.end
        );
        
        if (wordObj) {
          setCurrentWord({ 
            messageId, 
            wordIndex: wordObj.index 
          });
          
          // Update progress
          const progress = Math.min(100, (charIndex / text.length) * 100);
          setSpeechProgress(progress);
        }
      }
    };
    
    utterance.onend = () => {
      stopSpeaking();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      stopSpeaking();
    };
    
    speechSynthesisRef.current.utterance = utterance;
    setSpeakingMessageId(messageId);
    setSpeechPaused(false);
    window.speechSynthesis.speak(utterance);
  };
  
  // Pause speaking
  const pauseSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
    }
  };
  
  // Resume speaking
  const resumeSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    speechSynthesisRef.current = {
      utterance: null,
      messageId: null,
      text: '',
      currentIndex: 0,
      processedText: [],
      wordIndices: []
    };
    
    setSpeakingMessageId(null);
    setSpeechPaused(false);
    setSpeechProgress(0);
    setCurrentWord({ messageId: null, wordIndex: null });
  };
  
  // Update the changeRate function to handle 0.25x speed
  const changeRate = (newRate) => {
    setRate(newRate);
    
    // Update rate for current utterance if speaking
    if (speakingMessageId !== null && speechSynthesisRef.current.utterance) {
      try {
        // We need to stop and restart the speech with the new rate
        // Save the current state
        const currentText = speechSynthesisRef.current.text;
        const currentMessageId = speechSynthesisRef.current.messageId;
        const wasPaused = speechPaused;
        
        // Cancel current speech
        window.speechSynthesis.cancel();
        
        // Create new utterance with updated rate
        const utterance = new SpeechSynthesisUtterance(currentText);
        utterance.voice = selectedVoice;
        utterance.rate = newRate;
        utterance.pitch = 1;
        
        // Set up word boundary detection for highlighting
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const charIndex = event.charIndex || 0;
            
            // Find the word at this character position
            const wordObj = speechSynthesisRef.current.wordIndices.find(
              word => charIndex >= word.start && charIndex < word.end
            );
            
            if (wordObj) {
              setCurrentWord({ 
                messageId: currentMessageId, 
                wordIndex: wordObj.index 
              });
              
              // Update progress
              const progress = Math.min(100, (charIndex / currentText.length) * 100);
              setSpeechProgress(progress);
            }
          }
        };
        
        utterance.onend = () => {
          stopSpeaking();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          stopSpeaking();
        };
        
        // Update reference
        speechSynthesisRef.current.utterance = utterance;
        
        // Resume or keep paused based on previous state
        if (!wasPaused) {
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeechPaused(true);
        }
        
        console.log(`Speech rate changed to ${newRate}x`);
      } catch (error) {
        console.error('Error changing speech rate:', error);
        setError('Could not change speech rate. Please try again.');
      }
    }
  };
  
  // Toggle listening for speech recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
      setIsListening(false);
    } else {
      setError('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        setIsListening(true);
        } catch (err) {
          console.error('Error starting speech recognition:', err);
          setError('Could not start speech recognition. Please try again.');
        }
      } else {
        setError('Speech recognition is not supported in your browser.');
      }
    }
  };

  // Function to generate response via backend API
  async function generateResponse(userQuery) {
    if (!userQuery || userQuery.trim() === "") return;

    try {
      const result = await axios.post('/api/therapy-session', { message: userQuery });

      return {
        text: result.data.response,
        images: []
      };
    } catch (err) {
      console.error('API error:', err?.message || err);
      throw new Error(err?.response?.data?.message || 'Failed to generate response');
    }
  }
  
  const handleSubmitWithQuery = async (userQuery) => {
    if (!userQuery.trim() || isLoading) return;
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Add user message to conversation
    setConversation(prev => [...prev, { type: MessageType.USER, text: userQuery }]);
    
    // Add loading indicator
    setConversation(prev => [...prev, { type: MessageType.LOADING }]);
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generateResponse(userQuery);
      
      // Process the text for speech before adding to conversation
      const { tokens, wordIndices } = processMessageForSpeech(response.text);
      
      // Remove loading indicator and add AI response with any images
      setConversation(prev => {
        const newConv = prev.filter(msg => msg.type !== MessageType.LOADING);
        return [
          ...newConv, 
          { 
            type: MessageType.AI, 
            text: response.text,
            images: response.images,
            processedText: tokens,
            wordIndices
          }
        ];
      });
    } catch (err) {
      console.error('Error getting response:', err);
      setError('Sorry, something went wrong. Please try again.');
      
      // Remove loading indicator
      setConversation(prev => prev.filter(msg => msg.type !== MessageType.LOADING));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    
    const userMessage = query.trim();
    setQuery('');
    
    await handleSubmitWithQuery(userMessage);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  // Render a word with highlighting if it's the current word being spoken
  const renderWord = (token, tokenIndex, messageId) => {
    const isHighlighted = currentWord.messageId === messageId && 
                        currentWord.wordIndex === tokenIndex;
    
    return (
      <Word 
        key={`word-${tokenIndex}`} 
        className={isHighlighted ? 'highlighted' : ''}
      >
        {token.value}
      </Word>
    );
  };

  return (
    <PageContainer>
      <PageHeader>Best Buddy</PageHeader>
      <PageFeatureImage src="/images/bestbuddy.png" alt="Best Buddy" />
      
      {/* Controls Section */}
      <ControlsSection>
        <ControlGroup>
          <Label htmlFor="voice-select">Select Voice</Label>
          <Select 
            id="voice-select"
            value={voices.indexOf(selectedVoice)}
            onChange={(e) => setSelectedVoice(voices[e.target.value])}
            disabled={voices.length === 0}
          >
            {voices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name}
              </option>
            ))}
          </Select>
        </ControlGroup>
        
        <ControlGroup>
          <Label>Speed:</Label>
          <SpeedBar>
            <SliderRow>
              <SliderEndIcon>
                <WalkingPersonIcon />
              </SliderEndIcon>
              <SliderTrack>
                <SliderProgressTrack value={rate} />
                <SliderInput
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={rate}
                  onChange={(e) => changeRate(parseFloat(e.target.value))}
                />
                <SliderMarkers>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <SliderMarker 
                      key={speed} 
                      active={rate >= speed}
                      onClick={() => changeRate(speed)}
                    />
                  ))}
                </SliderMarkers>
              </SliderTrack>
              <SliderEndIcon>
                <RunningPersonIcon />
              </SliderEndIcon>
            </SliderRow>
            <SliderLabels>
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                <SliderLabel 
                  key={speed} 
                  active={rate === speed}
                  onClick={() => changeRate(speed)}
                >
                  {speed}x
                </SliderLabel>
              ))}
            </SliderLabels>
          </SpeedBar>
        </ControlGroup>
      </ControlsSection>
      
      <ChatSection>
        {/* Conversation Container */}
        <ConversationContainer ref={conversationRef}>
          {conversation.map((message, index) => {
            if (message.type === MessageType.LOADING) {
              return (
                <MessageBubble key={index} isUser={false}>
                  <LoadingDots>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </LoadingDots>
                </MessageBubble>
              );
            }
            
            return (
              <MessageBubble 
                key={index} 
                isUser={message.type === MessageType.USER}
              >
                {message.type === MessageType.AI && message.processedText ? (
                  <>
                    {message.processedText.map((token, tokenIndex) => 
                      token.type === 'word' 
                        ? renderWord(token, tokenIndex, index)
                        : token.value
                    )}
                  </>
                ) : (
                  message.text
                )}
                
                {message.images && message.images.length > 0 && (
                  message.images.map((imgSrc, imgIndex) => (
                    <ResponseImage 
                      key={imgIndex} 
                      src={imgSrc} 
                      alt="Generated illustration"
                      onError={(e) => {
                        console.error('Image failed to load');
                        e.target.style.display = 'none';
                      }}
                    />
                  ))
                )}
                
                {/* Add media controls to each AI message */}
                {message.type === MessageType.AI && (
                  <MessageControls>
                    <MediaButton 
                      onClick={() => speakingMessageId === index 
                        ? (speechPaused ? resumeSpeaking() : pauseSpeaking()) 
                        : startSpeaking(index)}
                      title={speakingMessageId === index 
                        ? (speechPaused ? "Resume" : "Pause") 
                        : "Read aloud"}
                      active={speakingMessageId === index}
                    >
                      {speakingMessageId === index 
                        ? (speechPaused ? <PlayIcon /> : <PauseIcon />) 
                        : <SpeakerIcon />}
                    </MediaButton>
                    
                    {speakingMessageId === index && (
                      <MediaButton 
                        onClick={stopSpeaking}
                        title="Stop"
                      >
                        <StopIcon />
                      </MediaButton>
                    )}
                  </MessageControls>
                )}
              </MessageBubble>
            );
          })}
        </ConversationContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {/* Input Area */}
        <InputArea>
          <InputField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            disabled={isLoading || isListening}
          />
          
          <ButtonContainer>
            <ActionButton 
              onClick={handleSubmit}
              disabled={isLoading || !query.trim() || isListening}
            >
              Ask Question
            </ActionButton>
            <ActionButton 
              onClick={toggleListening} 
              disabled={isLoading}
            >
              {isListening ? '⏹️ Stop' : '🎤 Speak'}
            </ActionButton>
          </ButtonContainer>
        </InputArea>
        
        {isListening && (
          <ListeningIndicator>
            <span>
              Listening<div className="pulse"></div>
            </span>
            Speak your question...
          </ListeningIndicator>
        )}
      </ChatSection>
    </PageContainer>
  );
};

export default TherapyChatbotPage; 