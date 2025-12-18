// frontend/src/components/Layout.tsx

import React, { ReactNode } from 'react';

// Se debe definir tailwind.config.js para usar estas clases
// EJ: therapy-bg-light, therapy-text, therapy-primary

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-therapy-bg-light font-sans flex justify-center py-6">
      <div 
        // Estilo inspirado en Apple: bordes suaves, sombra sutil, altura fija para chat
        className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl p-0 flex h-[90vh] overflow-hidden" 
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;