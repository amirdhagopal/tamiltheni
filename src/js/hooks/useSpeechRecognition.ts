import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import {
    SpeechRecognitionInstance,
    SpeechRecognitionEventResult,
    SpeechRecognitionErrorEventResult,
} from '../../types';

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'recording' | '' }>({
        text: '',
        type: '',
    });
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const onResultRef = useRef<((transcript: string) => void) | null>(null);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore if already stopped
            }
            recognitionRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(
        async (onResult: (transcript: string) => void) => {
            const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognitionClass) {
                alert('Speech recognition is not supported in this browser.');
                return;
            }

            stopRecording(); // Reset

            try {
                // "Warm up" the microphone - this often fixes "network" errors in Chrome
                // that are actually caused by microphone initialization failures.
                setFeedback({ text: 'Starting microphone...', type: 'recording' });
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop the stream, we just wanted to ensure access
                stream.getTracks().forEach((track) => track.stop());

                const recognition = new SpeechRecognitionClass();
                recognition.lang = 'ta-IN';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onresult = (event: SpeechRecognitionEventResult) => {
                    const speechResult = event.results[0][0].transcript.trim();
                    console.log('[Speech] Result:', speechResult);
                    if (onResultRef.current) {
                        onResultRef.current(speechResult);
                    }
                };

                recognition.onerror = (event: SpeechRecognitionErrorEventResult) => {
                    console.error('[Speech] Error:', event.error);
                    let msg = event.error;
                    if (event.error === 'network') {
                        msg = 'Network error (check internet/HTTPS)';
                    } else if (event.error === 'not-allowed') {
                        msg = 'Microphone blocked';
                    }
                    setFeedback({ text: 'Error: ' + msg, type: 'error' });
                    setIsRecording(false);
                };

                recognition.onend = () => {
                    console.log('[Speech] Session ended.');
                    setIsRecording(false);
                };

                onResultRef.current = onResult;
                recognitionRef.current = recognition;

                recognition.start();
                setIsRecording(true);
                setFeedback({ text: 'Listening for Tamil...', type: 'recording' });
            } catch (e: any) {
                console.error('[Speech] Start failed:', e);
                let msg = 'Error starting mic';
                if (e.name === 'NotAllowedError') msg = 'Microphone access denied';
                if (e.name === 'NotFoundError') msg = 'No microphone found';
                setFeedback({ text: msg, type: 'error' });
                setIsRecording(false);
            }
        },
        [stopRecording]
    );

    useEffect(() => {
        return () => stopRecording();
    }, [stopRecording]);

    const toggleRecording = useCallback(
        (onResult: (transcript: string) => void) => {
            if (isRecording) {
                stopRecording();
                if (feedback.type === 'recording') {
                    setFeedback({ text: '', type: '' });
                }
            } else {
                startRecording(onResult);
            }
        },
        [isRecording, startRecording, stopRecording, feedback.type]
    );

    return {
        isRecording,
        feedback,
        setFeedback, // Allow manual feedback setting (e.g. Correct/Incorrect)
        toggleRecording,
        stopRecording,
    };
}
