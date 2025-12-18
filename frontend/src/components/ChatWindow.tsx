// frontend/src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageDisplay from './MessageDisplay';
import VoiceRecorder from './VoiceRecorder'; // Componente 5
import { SystemStatus } from '../types/ChatTypes';

const ChatWindow: React.FC = () => {
    const { selectedChat, sendMessage, systemStatus } = useChat();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false); // Podría reflejar el estado de procesamiento de Gemini
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Asumimos que los mensajes están disponibles inmediatamente en selectedChat.messages
    const messages = selectedChat?.messages || []; 
    
    // Auto-scroll al final (CRÍTICO para UX)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);


    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat) return;

        const textToSend = input.trim();
        setInput('');
        setIsTyping(true);

        try {
            await sendMessage(textToSend, 'text');
        } catch (error) {
            console.error("Fallo la comunicación con el sistema:", error);
        } finally {
            setIsTyping(false);
        }
    };
    
    const isInputDisabled = systemStatus === 'CLOSED' || isTyping;

    if (!selectedChat) {
        return (
            <div className="flex-grow flex items-center justify-center text-gray-500 text-2xl font-light">
                Selecciona un espacio temático para comenzar o crea uno nuevo.
            </div>
        );
    }
    
    return (
        <div className="flex-grow flex flex-col p-8 h-full">
            <header className="border-b pb-4 mb-4">
                <h3 className="text-2xl font-bold text-therapy-text">{selectedChat.name}</h3>
                <p className="text-md text-gray-600">
                    Espacio de acompañamiento. Recuerda que la palabra es un movimiento importante.
                </p>
            </header>

            {/* Area de Mensajes */}
            <div className="flex-grow overflow-y-auto pr-3">
                {messages.map((msg) => (
                    <MessageDisplay key={msg.id} message={msg} />
                ))}
                {(isTyping || systemStatus === 'CLOSING_INITIATED') && (
                    <div className="text-therapy-primary italic text-lg mb-4">
                        {systemStatus === 'CLOSING_INITIATED' ? "El sistema está cerrando con cuidado..." : "El sistema está pensando profundamente..."}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Area de Input y Modo Llamada */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-4">
                
                {/* Modo Texto */}
                <form onSubmit={handleSendText} className="flex-grow flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isInputDisabled ? "Espacio cerrado por hoy." : "Escribe aquí tu reflexión..."}
                        disabled={isInputDisabled}
                        className="flex-grow p-4 border-2 border-gray-300 rounded-xl focus:ring-therapy-primary focus:border-therapy-primary text-lg transition duration-200"
                    />
                    {/* REQUISITO: Botón grande */}
                    <button
                        type="submit"
                        disabled={!input.trim() || isInputDisabled}
                        className={`px-6 py-3 text-white font-bold rounded-xl text-lg transition duration-200 shadow-md ${
                            (!input.trim() || isInputDisabled) ? 'bg-gray-400 cursor-not-allowed' : 'bg-therapy-primary hover:bg-opacity-90'
                        }`}
                    >
                        Enviar
                    </button>
                </form>

                {/* Modo Llamada (CRÍTICO) */}
                <VoiceRecorder />
                
            </div>
        </div>
    );
};

export default ChatWindow;