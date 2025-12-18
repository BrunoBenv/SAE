import React, { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';

// --- ÍCONOS REALES (SVG) ---
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>
);

const VoiceRecorder: React.FC = () => {
    const { sendMessage, systemStatus } = useChat();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Referencias para manejar las APIs del navegador
    const recognitionRef = useRef<any>(null);

    // --- Configuración de STT (Speech-to-Text) ---
    const setupRecognition = useCallback(() => {
        // Compatibilidad con Chrome/Edge (webkitSpeechRecognition) y estándar
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES'; // Español
        recognition.continuous = false;
        recognition.interimResults = false;
        
        return recognition;
    }, []);

    // --- Configuración de TTS (Text-to-Speech) ---
    const setupSynthesis = useCallback(() => {
        if (!('speechSynthesis' in window)) return null;
        return window.speechSynthesis;
    }, []);

    // --- Manejo de la Respuesta de Voz (Lectura) ---
    const speakResponse = (text: string) => {
        const synth = setupSynthesis();
        if (synth) {
            // Cancelar cualquier audio previo
            synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Intentar buscar una voz en español natural
            const voices = synth.getVoices();
            const spanishVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) || 
                                 voices.find(v => v.lang.startsWith('es'));
            
            if (spanishVoice) utterance.voice = spanishVoice;
            
            utterance.rate = 0.9; // Un poco más lento para que sea calmado
            utterance.pitch = 1;
            
            synth.speak(utterance);
        }
    };

    const startRecording = () => {
        if (systemStatus === 'CLOSED') return;

        const recognition = setupRecognition();
        if (!recognition) {
            alert("Tu navegador no soporta el reconocimiento de voz. Por favor usa Chrome o Edge.");
            return;
        }

        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcripción de usuario:", transcript);
            setIsRecording(false);
            
            // Procesar el mensaje
            await handleVoiceMessage(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Error de reconocimiento de voz:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert("Por favor permite el acceso al micrófono.");
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };
    
    // --- Flujo Completo: Enviar Audio -> Recibir Texto -> Leer Texto ---
    const handleVoiceMessage = async (transcript: string) => {
        setIsProcessing(true);

        try {
            // 1. Enviar transcripción a la IA (Esto actualiza el chat en el Contexto)
            const responseText = await sendMessage(transcript, 'call');
            
            // 2. Leer la respuesta en voz alta (si existe)
            if (responseText) {
                speakResponse(responseText);
            }

        } catch (error) {
            console.error("Error procesando voz:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const isDisabled = isProcessing || systemStatus === 'CLOSED';
    
    return (
        <div className="relative flex items-center justify-center">
             {/* Animación de Ondas (Solo si graba o procesa) */}
            {(isRecording || isProcessing) && (
                <motion.div
                    className={`absolute rounded-full ${isRecording ? 'bg-red-200' : 'bg-blue-200'} opacity-50`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '100%', height: '100%', minWidth: '60px', minHeight: '60px' }}
                />
            )}
            
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isDisabled}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center 
                    text-white transition-all duration-200 shadow-lg relative z-10
                    ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-therapy-primary hover:bg-opacity-90'
                    }
                    ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : ''}
                `}
                title={isRecording ? "Detener Grabación" : "Iniciar Llamada por Voz"}
            >
                {isRecording ? <StopIcon /> : <MicIcon />}
            </button>

            {/* Texto de estado debajo */}
            {isRecording && (
                <p className="absolute -bottom-8 text-xs text-red-500 font-bold whitespace-nowrap animate-pulse">
                    Escuchando...
                </p>
            )}
             {isProcessing && (
                <p className="absolute -bottom-8 text-xs text-therapy-primary font-bold whitespace-nowrap animate-pulse">
                    Pensando...
                </p>
            )}
        </div>
    );
};

export default VoiceRecorder;