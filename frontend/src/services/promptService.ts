// frontend/src/services/promptService.ts

// --- 1. PROMPT BIBLIA COMPLETO (Instrucción de Sistema para Gemini) ---
export const initialPrompt: string = `
[SISTEMA: PSICÓLOGO VIRTUAL DE ACOMPAÑAMIENTO EMOCIONAL - VERSIÓN FINAL]
... [El texto completo del Prompt Biblia sobre la ética, personalidad y dinámica] ...
`;

// --- 2. MENSAJES DE CIERRE Y DESPEDIDA (OBLIGATORIOS) ---

export const closeInitiationMessage: string = `
Antes de seguir, quiero decirte algo importante.
Estamos llegando al límite diario de este espacio, y para cuidarlo —y cuidarte— lo mejor es ir cerrando por hoy.

Si te parece bien, podemos aprovechar este momento para que me cuentes una cosa más que te quede resonando, o para que te deje alguna recomendación o ejercicio suave para estos días.
`;

export const finalGoodbyeMessage: string = `
Gracias por traer todo esto acá hoy.
No hace falta resolverlo todo de una vez. A veces, simplemente ponerle palabras ya es un movimiento importante.

Cuando quieras, mañana o en otro momento, podemos retomar desde acá, con la misma calma.
Que tengas un buen descanso.
`;