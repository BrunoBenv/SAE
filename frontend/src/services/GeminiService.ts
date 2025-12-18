// frontend/src/services/GeminiService.ts

import { Message, API_NAME, SystemStatus } from '../types/ChatTypes';
import { initialPrompt, finalGoodbyeMessage } from './promptService';

// --- CONFIGURACIÓN ---
const API_KEY_CHAT = import.meta.env.VITE_APP_GEMINI_CHAT_API_KEY || '';
const API_KEY_CALL = import.meta.env.VITE_APP_GEMINI_CALL_API_KEY || '';

// Usamos el modelo Flash. Al usar fetch directo, controlamos exactamente la versión.
const MODEL_NAME = 'gemini-flash-latest'; 

const getAPIKey = (api: API_NAME): string => {
    return api === 'CHAT' ? API_KEY_CHAT : API_KEY_CALL;
};

export const generateGeminiResponse = async (
  history: Message[],
  userMessage: string,
  activeAPI: API_NAME,
  systemStatus: SystemStatus
): Promise<{ responseText: string, tokensUsed: number }> => {

    // 1. Manejo del Cierre
    if (systemStatus === 'CLOSED') {
        return { responseText: finalGoodbyeMessage, tokensUsed: 0 };
    }

    const apiKey = getAPIKey(activeAPI);
    if (!apiKey) {
        console.error("FALTA API KEY: Verifica tu archivo .env.local");
        return { responseText: "Error: Falta configurar la API Key.", tokensUsed: 0 };
    }

    // 2. Preparar el Payload (JSON) para la API REST de Google
    // Documentación: https://ai.google.dev/api/rest/v1beta/models/generateContent
    
    // Convertir historial
    const contents = history.map(msg => ({
        role: msg.role === 'system' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Agregar el mensaje actual del usuario
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const payload = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: initialPrompt }]
        },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: activeAPI === 'CALL' ? 400 : 800,
        }
    };

    try {
        // 3. LLAMADA DIRECTA (Sin librería)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("ERROR API GEMINI:", errorData);
            throw new Error(`Error ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // 4. Extraer respuesta
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error("La API no devolvió texto.");
        }

        const totalTokens = data.usageMetadata?.totalTokenCount || 0;

        return { 
            responseText: text, 
            tokensUsed: totalTokens
        };

    } catch (error) {
        console.error("FALLO CRÍTICO EN SERVICIO GEMINI:", error);
        return {
             responseText: "Lo siento, hubo un problema de conexión. ¿Me lo podrías repetir?",
             tokensUsed: 0
        };
    }
};