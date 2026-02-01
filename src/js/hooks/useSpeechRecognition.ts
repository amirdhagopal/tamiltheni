import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

// Types
export interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' | 'recording' | '' }>({ text: '', type: '' });
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const onResultRef = useRef<((transcript: string) => void) | null>(null);

    useEffect(() => {
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionClass) {
            const recognition = new SpeechRecognitionClass();
            recognition.lang = 'ta-IN';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript.trim();
                if (onResultRef.current) {
                    onResultRef.current(speechResult);
                }
            };

            recognition.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    console.error('Speech recognition error:', event.error);
                    setFeedback({ text: 'Error: ' + event.error, type: 'error' });
                }
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn('Speech recognition not supported.');
        }
    }, []);

    const startRecording = useCallback((onResult: (transcript: string) => void) => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        try {
            onResultRef.current = onResult;
            recognitionRef.current.start();
            setIsRecording(true);
            setFeedback({ text: 'Listening for Tamil...', type: 'recording' });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        if (feedback.type === 'recording') {
            setFeedback({ text: '', type: '' });
        }
    }, [isRecording, feedback.type]);

    const toggleRecording = useCallback((onResult: (transcript: string) => void) => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording(onResult);
        }
    }, [isRecording, startRecording, stopRecording]);

    return {
        isRecording,
        feedback,
        setFeedback, // Allow manual feedback setting (e.g. Correct/Incorrect)
        toggleRecording,
        stopRecording
    };
}
