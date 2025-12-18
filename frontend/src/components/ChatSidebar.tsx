import React from 'react';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { chats, selectedChat, selectChat, createNewChat, deleteChat, renameChat, logout, user } = useChat();

  const handleDelete = (e: React.MouseEvent, chatId: number) => {
      e.stopPropagation();
      if (window.confirm("¿Seguro que quieres borrar esta conversación?")) {
          deleteChat(chatId);
      }
  };

  const handleRename = (e: React.MouseEvent, chatId: number, currentName: string) => {
      e.stopPropagation();
      const newName = window.prompt("Nuevo nombre para la charla:", currentName);
      if (newName && newName.trim() !== "") {
          renameChat(chatId, newName.trim());
      }
  };

  return (
    <div className="w-64 bg-[#f0f4f9] text-gray-700 flex flex-col h-full border-r border-gray-200 font-sans">
      
      {/* Cabecera */}
      <div className="p-4">
        {/* Saludo Usuario */}
        <div className="flex items-center gap-2 mb-6 text-gray-600 text-sm font-medium">
           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
             {user?.username.charAt(0).toUpperCase()}
           </div>
           <span>Hola, {user?.username}</span>
        </div>

        {/* Botón Nuevo Chat */}
        <button
          onClick={() => createNewChat(`Charla del ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#dde3ea] hover:bg-[#cdd3da] text-gray-700 rounded-full transition-all duration-200 shadow-sm mb-4 group"
        >
          <div className="p-1 bg-white rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide">Nueva charla</span>
        </button>
      </div>

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Historial</p>
        
        {chats.length === 0 && (
            <p className="px-4 text-xs text-gray-400 italic">No hay charlas guardadas</p>
        )}

        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => selectChat(chat)}
            className={`
                group relative flex items-center justify-between px-4 py-2.5 rounded-full cursor-pointer text-sm transition-all duration-200
                ${selectedChat?.id === chat.id 
                    ? 'bg-[#c2e7ff] text-[#001d35] font-semibold' 
                    : 'text-gray-600 hover:bg-[#e1e5ea]'
                }
            `}
          >
            {/* Icono + Texto */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 min-w-[16px] opacity-70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="truncate">{chat.name}</span>
            </div>

            {/* Acciones (Editar y Borrar) - Solo visibles en Hover */}
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botón Editar */}
                <button
                    onClick={(e) => handleRename(e, chat.id, chat.name)}
                    className="p-1.5 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all mr-1"
                    title="Cambiar nombre"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </button>

                {/* Botón Borrar */}
                <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-all"
                    title="Borrar charla"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer / Salir */}
      <div className="p-4 border-t border-gray-200 bg-[#f0f4f9]">
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-all w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span className="font-medium">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;