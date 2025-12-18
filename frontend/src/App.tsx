// frontend/src/App.tsx

import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import ChatSidebar from './components/ChatSidebar'; // Asegúrate que el nombre coincida con tu archivo
import ChatWindow from './components/ChatWindow';

// Componente de Login Simple
const LoginScreen = () => {
  const { login } = useChat();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username.toLowerCase() === 'estela' && password === 'vittoymilo') ||
      (username.toLowerCase() === 'bruno' && password === '1234')
    ) {
      login(username);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Bienvenida</h2>
            <p className="text-gray-500 text-sm">Ingresa para conversar</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: estela"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

// Layout Principal
const MainLayout = () => {
  const { user } = useChat();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    // AQUÍ ESTÁ LA CLAVE DEL DISEÑO: Flex row + altura completa
    <div className="flex flex-row h-screen w-full overflow-hidden bg-white">
      {/* Sidebar fijo a la izquierda */}
      <div className="flex-shrink-0 h-full">
        <ChatSidebar />
      </div>
      
      {/* Ventana de chat ocupando el resto */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatWindow />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
};

export default App;