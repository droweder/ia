import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export const useSpeechRecognition = ({ onResult, onError, lang = 'pt-BR' }: UseSpeechRecognitionOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef<{
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: unknown) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isSupported) return;
    if (recognitionRef.current) return;

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (typeof transcript === 'string') onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      setIsRecording(false);
      if (onError && typeof err === 'string') onError(err);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [isSupported, lang, onResult, onError]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  return { isRecording, toggleRecording, isSupported };
};
