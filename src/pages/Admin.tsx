
import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Search, Bell, HelpCircle, Settings, Star, X, Briefcase, Plus, MoreHorizontal, ChevronLeft, ChevronRight, ArrowUp, ArrowLeft, MessageSquare, LayoutGrid, Folder, FileText, Cloud, MessageCircle, User, Copy, Mail, Users, Calendar, Info, Globe, Moon, Sun, BookOpen, Headphones, ChevronDown, Check, ChevronUp, LogOut, Link, Trash2, AlertCircle, Upload, Camera, Building2, Image as ImageIcon, Pencil, Phone, Instagram, Eye, EyeOff } from 'lucide-react';
import { Project, Client, Note, Notification } from '../types';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase";
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import AdminLogin, { isAuthorizedAdminEmail } from '../components/AdminLogin';
import { getProjects, sortProjectsByRecent, addProject, updateProject, deleteProject, getClients, addClient, updateClient, deleteClient, clearFictitiousClients, clearAllClients, getNotifications, markNotificationsAsRead, syncAllToFirestore, getNotes, addNote, deleteNote } from '../utils/storage';
import ProjectForm from '../components/ProjectForm';
import ConfirmModal from '../components/ConfirmModal';
import ProjectNoteModal from '../components/ProjectNoteModal';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NotesTab } from '../components/admin/NotesTab';
import { FilesTab } from '../components/admin/FilesTab';
import { ConversasTab } from '../components/admin/ConversasTab';
import { EmailTab } from '../components/admin/EmailTab';
import { CalendarTab } from '../components/admin/CalendarTab';
import { KnowledgeBaseTab } from '../components/admin/KnowledgeBaseTab';
import { MessagesTab } from '../components/admin/MessagesTab';
import { SettingsTab } from '../components/admin/SettingsTab';
import { LearnTab } from '../components/admin/LearnTab';
import { HelpCenterTab } from '../components/admin/HelpCenterTab';
import { SupportTab } from '../components/admin/SupportTab';

function useOnClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    addProject: 'Add Project',
    projectsOverview: 'Projects Overview',
    overviewDesc: 'Distribution of your portfolio projects by category.',
    totalProjects: 'Total Projects',
    favorites: 'Favorites',
    totalViews: 'Total Views',
    managePortfolio: 'Manage Portfolio',
    manageDesc: 'View, edit, and organize all your video and photo projects.',
    noProjects: 'No projects available to display.',
    loadMore: 'Load More',
    clients: 'Clients',
    language: 'English Language',
    ptLanguage: 'Portuguese (Brazil)',
    newProject: 'New Project',
    navigate: 'Navigate',
    more: 'More',
    settings: 'Settings',
    nightMode: 'Night Mode',
    helpCenter: 'Help Center',
    support: 'Support',
    notes: 'Notes',
    files: 'Files',
    chats: 'Chats',
    mail: 'Mail',
    users: 'Users',
    calendar: 'Calendar',
    knowledgeBase: 'Knowledge Base',
    messenger: 'Messenger',
    learn: 'Learn',
    links: 'Links',
    search: 'Search...',
    news: 'News',
    upgrade: 'Upgrade',
    allProjects: 'All Projects',
    allProjectsDesc: 'Organize and manage your complete portfolio across all categories.',
    gridView: 'Grid View',
    listView: 'List View',
    manageClients: 'Manage Clients',
    manageClientsDesc: 'Manage your portfolio clients here.',
    backToSite: 'Back to site',
    logout: 'Logout'
  },
  pt: {
    dashboard: 'Painel',
    projects: 'Projetos',
    addProject: 'Adicionar Projeto',
    projectsOverview: 'Visão Geral',
    overviewDesc: 'Distribuição dos projetos do portfólio por categoria.',
    totalProjects: 'Total de Projetos',
    favorites: 'Favoritos',
    totalViews: 'Total de Views',
    managePortfolio: 'Gerenciar Portfólio',
    manageDesc: 'Visualize, edite e organize seus projetos de vídeo e foto.',
    noProjects: 'Nenhum projeto disponível.',
    loadMore: 'Carregar Mais',
    clients: 'Clientes',
    language: 'Inglês',
    ptLanguage: 'Português (Brasil)',
    newProject: 'Novo Projeto',
    navigate: 'Navegação',
    more: 'Mais',
    settings: 'Configurações',
    nightMode: 'Modo Escuro',
    helpCenter: 'Central de Ajuda',
    support: 'Suporte',
    notes: 'Notas',
    files: 'Arquivos',
    chats: 'Conversas',
    mail: 'E-mail',
    users: 'Usuários',
    calendar: 'Calendário',
    knowledgeBase: 'Base de Conhecimento',
    messenger: 'Mensagens',
    learn: 'Aprender',
    links: 'Links',
    search: 'Pesquisar...',
    news: 'Notícias',
    upgrade: 'Upgrade',
    allProjects: 'Todos os Projetos',
    allProjectsDesc: 'Organize e gerencie seu portfólio completo em todas as categorias.',
    gridView: 'Em Grade',
    listView: 'Em Lista',
    manageClients: 'Gerenciar Clientes',
    manageClientsDesc: 'Gerencie os clientes do seu portfólio aqui.',
    backToSite: 'Voltar ao site',
    logout: 'Sair'
  }
};

const iconMap: Record<string, any> = {
  LayoutGrid, Folder, FileText, Cloud, MessageCircle, Mail, Users, Calendar, Info, Briefcase, MessageSquare, Settings, Globe, Moon, Sun, BookOpen, HelpCircle, Headphones
};

const NavItem = ({ icon: Icon, label, active = false, disabled = false, onClick, collapsed = false, draggable, onDragStart, onDragOver, onDrop }: { icon: any, label: string, active?: boolean, disabled?: boolean, onClick?: () => void, collapsed?: boolean, draggable?: boolean, onDragStart?: any, onDragOver?: any, onDrop?: any, key?: React.Key }) => (
  <button 
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex items-center gap-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${active ? 'bg-[#222222] dark:bg-[#222222] text-black dark:text-white bg-gray-200' : 'text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/50'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'w-full px-3'}`}
    title={collapsed ? label : undefined}
  >
    <Icon size={16} strokeWidth={2.5} className={collapsed ? "flex-shrink-0" : ""} />
    {!collapsed && <span>{label}</span>}
  </button>
);

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn("navigator.clipboard failed, using fallback:", e);
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    textArea.remove();
    return success;
  } catch {
    return false;
  }
};

const Card = React.memo(({ 
  project, 
  viewMode = 'grid',
  isSelected = false,
  isVisible = true,
  notesCount = 0,
  onToggleSelect,
  onToggleFavorite,
  onClick,
  onActionClick,
  onAddNote,
  onCopyLinkFeedback,
  onUpdateVisibility,
}: { 
  project: Project, 
  viewMode?: 'grid' | 'list',
  isSelected?: boolean,
  isVisible?: boolean,
  notesCount?: number,
  onToggleSelect?: (e: React.MouseEvent) => void,
  onToggleFavorite?: (e: React.MouseEvent) => void,
  onClick?: () => void,
  onActionClick?: (action: 'review' | 'download' | 'delete', project: Project) => void,
  onAddNote?: (project: Project) => void,
  onCopyLinkFeedback?: (project: Project) => void,
  onUpdateVisibility?: (projectId: string, visibility: 'public' | 'unlisted') => void,
  key?: any;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isFavorite = project.isFavorite;
  const isUnlisted = project.visibility === 'unlisted';

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.controls')) return;
    onClick?.();
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/projeto/${project.id}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      onCopyLinkFeedback?.(project);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const logo = (
    <img 
      src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"} 
      alt={project.title} 
      className="w-full h-full object-cover" 
      loading="eager"
      decoding="async"
    />
  );

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick} 
        className={`${!isVisible ? 'hidden' : ''} bg-white dark:bg-[#111111] border ${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#1f1f1f]'} rounded-2xl p-4 flex items-center relative hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors cursor-pointer group shadow-sm`}
      >
         <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-inner bg-gray-100 dark:bg-[#1a1a1a] mr-4">
            {logo}
         </div>
         <div className="flex-1">
           <div className="flex items-center gap-2">
             <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">{project.title}</h3>
             {isFavorite && (
               <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                 <Star size={9} className="fill-amber-500 text-amber-500" /> Destaque
               </span>
             )}
           </div>
           <p className="text-[13px] text-gray-500 dark:text-[#777] font-medium">{project.category}</p>
         </div>
         <div className="flex items-center gap-2.5 controls">
           {/* Copiar Link do Projeto (Corrente) */}
           <button 
             type="button"
             onClick={handleCopyLink}
             className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
               copiedLink 
                 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30' 
                 : 'text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] border border-transparent'
             }`}
             title={copiedLink ? "Link copiado!" : "Copiar link do projeto"}
           >
             {copiedLink ? <Check size={13} className="text-emerald-500" strokeWidth={2.5} /> : <Link size={13} strokeWidth={2.5} />}
             <span className="text-[11px] font-medium">{copiedLink ? 'Copiado!' : 'Link'}</span>
           </button>

           {/* Adicionar / Ver Notas (Papel) */}
           <button 
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               onAddNote?.(project);
             }}
             className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer border border-transparent"
             title="Adicionar / Ver Notas do Projeto"
           >
             <FileText size={13} strokeWidth={2.5} />
             {notesCount > 0 ? (
               <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{notesCount}</span>
             ) : (
               <span className="text-[11px] font-medium">Nota</span>
             )}
           </button>

           <div className="h-4 w-px bg-gray-200 dark:bg-[#333] mx-1" />

           {/* Dropmenu de Visibilidade (Público / Não listado) */}
           <div className="relative">
             <button 
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 setShowVisibilityMenu(!showVisibilityMenu);
                 setShowMenu(false);
               }}
               className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border text-xs font-semibold ${
                 isUnlisted 
                   ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/40 shadow-xs' 
                   : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/40 shadow-xs'
               }`}
               title={isUnlisted ? "Não listado (Apenas com link)" : "Público (Visível na página principal)"}
             >
               {isUnlisted ? <EyeOff size={12} strokeWidth={2.5} /> : <Globe size={12} strokeWidth={2.5} />}
               <span className="text-[11px]">{isUnlisted ? 'Não listado' : 'Público'}</span>
             </button>

             {showVisibilityMenu && (
               <>
                 <div 
                   className="fixed inset-0 z-[65]" 
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowVisibilityMenu(false);
                   }} 
                 />
                 <div className="absolute right-0 top-8 w-52 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl py-2 z-[70] controls overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                   <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Visibilidade</span>
                   </div>

                   <button
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowVisibilityMenu(false);
                       onUpdateVisibility?.(project.id, 'public');
                     }}
                     className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                       !isUnlisted 
                         ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                         : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
                     }`}
                   >
                     <div className="flex items-center gap-2">
                       <Globe size={14} className={!isUnlisted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
                       <span className="font-bold">Público</span>
                     </div>
                     {!isUnlisted && <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />}
                   </button>

                   <button
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowVisibilityMenu(false);
                       onUpdateVisibility?.(project.id, 'unlisted');
                     }}
                     className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                       isUnlisted 
                         ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' 
                         : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
                     }`}
                   >
                     <div className="flex items-center gap-2">
                       <EyeOff size={14} className={isUnlisted ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'} />
                       <span className="font-bold">Não listado</span>
                     </div>
                     {isUnlisted && <Check size={14} className="text-amber-600 dark:text-amber-400" strokeWidth={2.5} />}
                   </button>
                 </div>
               </>
             )}
           </div>
           <button 
             onClick={onToggleFavorite}
             className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#222] flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]"
           >
             <Star size={14} className={`${isFavorite ? 'fill-[#EAB308] text-[#EAB308]' : 'text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777]'} transition-colors`} />
           </button>
           <div className="relative controls">
             <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777] transition-colors">
               <MoreHorizontal size={20} />
             </button>
             {showMenu && (
               <div className="absolute right-0 top-6 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
                 <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar link de avaliação</button>
                 <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar código de download</button>
                 <div className="border-t border-gray-100 dark:border-[#2a2a2a] my-1" />
                 <button onClick={() => { setShowMenu(false); onActionClick?.('delete', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2">
                   <Trash2 size={13} />
                   Excluir projeto
                 </button>
               </div>
             )}
           </div>
         </div>
      </div>
    );
  }
  
  return (
    <div 
      onClick={handleCardClick} 
      className={`${!isVisible ? 'hidden' : ''} bg-white dark:bg-[#161616] border ${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#222]'} rounded-[20px] p-3 flex flex-col relative hover:bg-gray-50 dark:hover:bg-[#1c1c1c] transition-colors cursor-pointer group shadow-sm`}
    >
      
      {/* Thumbnail area */}
      <div className="w-full aspect-video mb-2.5 rounded-xl overflow-hidden bg-[#222] relative">
        <img 
           src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"} 
           alt={project.title} 
           className="w-full h-full object-cover" 
           loading="eager"
           decoding="async"
        />
        {isFavorite && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-400 text-[10px] font-bold flex items-center gap-1 shadow-md">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span>Fixado</span>
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col px-1">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-2 leading-tight truncate">{project.title}</h3>
        
        {/* Labels/Tags Row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1e293b]/60 dark:text-[#60a5fa] dark:border-[#334155] text-[10px] font-semibold transition-colors">
            {project.category || 'Categoria'}
          </span>
          {isFavorite && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/40 text-[10px] font-bold transition-colors flex items-center gap-1 shadow-xs">
              <Star size={10} className="fill-amber-500 text-amber-500" /> Destaque
            </span>
          )}
          {isUnlisted ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30 text-[10px] font-semibold transition-colors flex items-center gap-1">
              <EyeOff size={10} /> Não listado
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#14532d]/60 dark:text-[#4ade80] dark:border-[#166534] text-[10px] font-semibold transition-colors">
              {'Done'}
            </span>
          )}
        </div>

        {/* Bottom Bar Icons */}
        <div className="pt-2.5 border-t border-gray-100 dark:border-[#222] flex items-center justify-between controls">
          {/* Left actions: Corrente (copiar link) e Papel (adicionar nota). Ícone de check removido conforme solicitado */}
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#888]">
            {/* Corrente: Copiar link do projeto */}
            <button 
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                copiedLink 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-[#222] hover:text-black dark:hover:text-white border border-transparent'
              }`}
              title={copiedLink ? "Link copiado!" : "Copiar link do projeto"}
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="text-emerald-500" strokeWidth={2.5} />
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Link size={13} strokeWidth={2.5} />
                  <span className="text-[11px] font-medium hidden xs:inline">Link</span>
                </>
              )}
            </button>

            {/* Papel: Adicionar Nota ao projeto */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddNote?.(project);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#222] hover:text-black dark:hover:text-white transition-all cursor-pointer border border-transparent"
              title="Adicionar Nota a este projeto"
            >
              <FileText size={13} strokeWidth={2.5} />
              {notesCount > 0 ? (
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{notesCount}</span>
              ) : (
                <span className="text-[11px] font-medium hidden xs:inline">Nota</span>
              )}
            </button>
          </div>
          
          {/* Right actions (Light & Dark adaptive round buttons) */}
          <div className="flex items-center gap-2 relative">
            {/* Dropmenu de Visibilidade (Público / Não listado) */}
            <div className="relative">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVisibilityMenu(!showVisibilityMenu);
                  setShowMenu(false);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                  isUnlisted 
                    ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-500/40 shadow-xs' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-500/40 shadow-xs'
                }`}
                title={isUnlisted ? "Não listado (Apenas com link)" : "Público (Visível na página principal)"}
              >
                {isUnlisted ? <EyeOff size={12} strokeWidth={2.5} /> : <Globe size={12} strokeWidth={2.5} />}
              </button>

              {showVisibilityMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[65]" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVisibilityMenu(false);
                    }} 
                  />
                  <div className="absolute right-0 bottom-9 w-52 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl py-2 z-[70] controls overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Visibilidade</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVisibilityMenu(false);
                        onUpdateVisibility?.(project.id, 'public');
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        !isUnlisted 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe size={14} className={!isUnlisted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
                        <div>
                          <div className="font-bold">Público</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">Visível na página inicial</div>
                        </div>
                      </div>
                      {!isUnlisted && <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVisibilityMenu(false);
                        onUpdateVisibility?.(project.id, 'unlisted');
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        isUnlisted 
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <EyeOff size={14} className={isUnlisted ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'} />
                        <div>
                          <div className="font-bold">Não listado</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">Apenas com o link direto</div>
                        </div>
                      </div>
                      {isUnlisted && <Check size={14} className="text-amber-600 dark:text-amber-400" strokeWidth={2.5} />}
                    </button>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={onToggleFavorite}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-amber-50 text-amber-500 border border-amber-200 dark:bg-[#2a2415] dark:text-[#eab308] dark:border-amber-500/20' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black border border-gray-200/80 dark:bg-[#222] dark:hover:bg-[#333] dark:text-[#888] dark:hover:text-[#ccc] dark:border-transparent'
              }`}
              title="Favoritar"
            >
              <Star size={12} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black border border-gray-200/80 dark:bg-[#222] dark:hover:bg-[#333] dark:text-[#888] dark:hover:text-[#ccc] dark:border-transparent flex items-center justify-center transition-all cursor-pointer"
              title="Mais opções"
            >
              <MoreHorizontal size={12} strokeWidth={3} />
            </button>
            
            {showMenu && (
               <div className="absolute right-0 bottom-10 w-48 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl py-1 z-[60] controls overflow-hidden">
                 <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#333] transition-colors cursor-pointer">Gerar link de avaliação</button>
                 <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#333] transition-colors cursor-pointer">Gerar código de download</button>
                 <div className="border-t border-gray-100 dark:border-[#333] my-1" />
                 <button onClick={() => { setShowMenu(false); onActionClick?.('delete', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2 cursor-pointer">
                   <Trash2 size={13} />
                   Excluir projeto
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Admin() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isAuthorizedAdminEmail(user.email)) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsTreeOpen, setProjectsTreeOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<Record<string, boolean>>({
    'Imobiliário': true,
    'Publicidade': true,
    'Eventos': true,
    'Institucional': true,
  });
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<'Todas' | 'Imobiliário' | 'Publicitário' | 'Eventos' | 'Institucional'>('Todas');
  const [newProjectCategory, setNewProjectCategory] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const loadNotifs = () => setNotifications(getNotifications());
    loadNotifs();
    window.addEventListener('notificationsUpdated', loadNotifs as any);
    return () => window.removeEventListener('notificationsUpdated', loadNotifs as any);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [realProjects, setRealProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());

  const [realClients, setRealClients] = useState<Client[]>([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientInstagram, setNewClientInstagram] = useState('');
  const [newClientLogo, setNewClientLogo] = useState('');
  const [clientPhotoFile, setClientPhotoFile] = useState<File | null>(null);
  const [clientPhotoPreview, setClientPhotoPreview] = useState<string | null>(null);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clientSaveFeedback, setClientSaveFeedback] = useState<string | null>(null);
  const clientFileInputRef = useRef<HTMLInputElement>(null);
  
  const [actionModal, setActionModal] = useState<'review' | 'download' | null>(null);
  const [actionProject, setActionProject] = useState<Project | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  // Estados para Notas de Projetos e Feedback de Cópia
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteModalProject, setNoteModalProject] = useState<Project | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    setNotes(getNotes());
    const handleNotesUpdate = () => setNotes(getNotes());
    window.addEventListener('notes-updated', handleNotesUpdate);
    return () => window.removeEventListener('notes-updated', handleNotesUpdate);
  }, []);

  const handleSaveProjectNote = async (data: { title: string; content: string; category: string; isPinned: boolean }) => {
    if (!noteModalProject) return;
    addNote({
      ...data,
      projectId: noteModalProject.id,
      projectName: noteModalProject.title,
    });
    setNotes(getNotes());
  };

  const handleDeleteProjectNote = (noteId: string) => {
    deleteNote(noteId);
    setNotes(getNotes());
  };

  const handleCopyFeedback = (project: Project) => {
    setCopyToast(`Link do projeto "${project.title}" copiado para a área de transferência!`);
    setTimeout(() => setCopyToast(null), 3500);
  };

  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeletingClient(true);
    try {
      deleteClient(clientToDelete.id);
      setRealClients(getClients());
      setIsDeleteClientModalOpen(false);
      setClientToDelete(null);
    } catch (err) {
      console.warn("Aviso ao excluir cliente:", err);
    } finally {
      setIsDeletingClient(false);
    }
  };

  useEffect(() => {
    setRealClients(getClients());
    const handleClientsUpdate = () => setRealClients(getClients());
    window.addEventListener("clients-updated", handleClientsUpdate);
    return () => window.removeEventListener("clients-updated", handleClientsUpdate);
  }, []);

  const handleActionClick = (action: 'review' | 'download' | 'delete', project: Project) => {
    if (action === 'delete') {
      setProjectToDelete(project);
      setIsDeleteModalOpen(true);
      return;
    }
    setActionProject(project);
    setActionModal(action);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      setRealProjects(getProjects());
      if (editingProject?.id === projectToDelete.id) {
        setEditingProject(null);
        setIsCreating(false);
      }
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.warn("Aviso ao excluir projeto:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  
  // Theme & Language state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  
  // Navbar state
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  
  // Popups state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMenuConfig, setShowMenuConfig] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Refs for click outside
  const menuConfigRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuConfigRef, () => setShowMenuConfig(false));
  useOnClickOutside(notificationsRef, () => setShowNotifications(false));
  useOnClickOutside(profileMenuRef, () => setShowProfileMenu(false));
  useOnClickOutside(langMenuRef, () => setShowLangMenu(false));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Initial default sidebar menu items matching user request
  const defaultMenuItems = [
    { id: 'dashboard', iconName: 'LayoutGrid', labelKey: 'dashboard', disabled: false, section: 'main' },
    { id: 'projects', iconName: 'Folder', labelKey: 'projects', disabled: false, section: 'main' },
    { id: 'clients', iconName: 'Users', labelKey: 'clients', disabled: false, section: 'main' },
    { id: 'notes', iconName: 'FileText', labelKey: 'notes', disabled: false, section: 'main' },
    { id: 'files', iconName: 'Cloud', labelKey: 'files', disabled: false, section: 'main' },
    { id: 'chats', iconName: 'MessageCircle', labelKey: 'chats', disabled: false, section: 'main' },
    { id: 'mail', iconName: 'Mail', labelKey: 'mail', disabled: false, section: 'main' },
    { id: 'calendar', iconName: 'Calendar', labelKey: 'calendar', disabled: false, section: 'main' },
    { id: 'knowledgeBase', iconName: 'Info', labelKey: 'knowledgeBase', disabled: false, section: 'main' },
    { id: 'messenger', iconName: 'MessageSquare', labelKey: 'messenger', disabled: false, section: 'main' },
    { id: 'settings', iconName: 'Settings', labelKey: 'settings', disabled: false, section: 'more' },
    { id: 'learn', iconName: 'BookOpen', labelKey: 'learn', disabled: false, section: 'more' },
    { id: 'helpCenter', iconName: 'HelpCircle', labelKey: 'helpCenter', disabled: false, section: 'more' },
    { id: 'support', iconName: 'Headphones', labelKey: 'support', disabled: false, section: 'more' },
  ];

  // Sidebar reorder state with localStorage persistence
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const savedOrder = localStorage.getItem('animasystem_menu_items_order');
      if (savedOrder) {
        const orderIds: string[] = JSON.parse(savedOrder);
        const map = new Map(defaultMenuItems.map(item => [item.id, { ...item, disabled: false }]));
        const ordered: typeof defaultMenuItems = [];
        for (const id of orderIds) {
          const item = map.get(id);
          if (item) {
            ordered.push({ ...item, disabled: false });
            map.delete(id);
          }
        }
        for (const item of map.values()) {
          ordered.push({ ...item, disabled: false });
        }
        return ordered;
      }
    } catch (e) {
      console.error("Error loading menu order", e);
    }
    return defaultMenuItems;
  });

  const [visibleMenuIds, setVisibleMenuIds] = useState<Set<string>>(() => {
    try {
      const savedVisible = localStorage.getItem('animasystem_visible_menu_ids');
      if (savedVisible) {
        const ids: string[] = JSON.parse(savedVisible);
        return new Set(ids);
      }
    } catch (e) {
      console.error("Error loading visible menu items", e);
    }
    return new Set(defaultMenuItems.map(m => m.id));
  });
  
  const draggedItemIdRef = useRef<string | null>(null);
  const dragOverItemIdRef = useRef<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedProjectIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProjectIds(newSelected);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = realProjects.find(p => p.id === id);
    if (project) {
      const nextFavorite = !project.isFavorite;
      updateProject(id, { isFavorite: nextFavorite });
      setRealProjects(getProjects());
      setCopyToast(
        nextFavorite
          ? `"${project.title}" definido como destaque (fixado nos primeiros).`
          : `"${project.title}" removido dos destaques.`
      );
      setTimeout(() => setCopyToast(null), 3000);
    }
  };

  const handleUpdateProjectVisibility = (id: string, visibility: 'public' | 'unlisted') => {
    updateProject(id, { visibility });
    setRealProjects(getProjects());
    const project = getProjects().find(p => p.id === id);
    const title = project?.title || 'Projeto';
    setCopyToast(
      visibility === 'unlisted'
        ? `"${title}" definido como Não listado (acessível apenas por link).`
        : `"${title}" definido como Público (visível na página principal).`
    );
    setTimeout(() => setCopyToast(null), 3500);
  };

  const handleSaveProject = (data: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data as Omit<Project, 'id'>);
    }
    setRealProjects(getProjects());
    setIsCreating(false);
    setEditingProject(null);
  };

  
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string; code?: string } | null>(null);

  const handleSyncAll = async () => {
    setIsSyncingFirestore(true);
    setSyncStatus(null);
    try {
      const res = await syncAllToFirestore();
      setSyncStatus(res);
      if (!res.success && res.code === 'permission-denied') {
        setFirestorePermissionError(true);
      }
    } catch (e: any) {
      setSyncStatus({ success: false, message: e?.message || "Falha na sincronização." });
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const handleClientPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'pt' ? 'Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP, SVG).' : 'Please select a valid image file.');
      return;
    }

    setClientPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setClientPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveClientPhoto = () => {
    setClientPhotoFile(null);
    setClientPhotoPreview(null);
    setNewClientLogo('');
    if (clientFileInputRef.current) {
      clientFileInputRef.current.value = '';
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClientName(client.name || '');
    setNewClientEmail(client.email || '');
    setNewClientCompany(client.company || '');
    setNewClientPhone(client.phone || '');
    setNewClientInstagram(client.instagram || '');
    setNewClientLogo(client.logoUrl || '');
    setClientPhotoPreview(client.logoUrl || null);
    setClientPhotoFile(null);
    setClientSaveFeedback(null);
    setIsCreatingClient(true);
  };

  const handleSaveClient = async () => {
    const trimmedName = newClientName.trim();
    if (!trimmedName) return;

    setIsSavingClient(true);
    setClientSaveFeedback(null);

    let finalLogoUrl = newClientLogo.trim();

    // Se houver foto selecionada do PC, tenta upload no Firebase Storage ou fallback para Data URL
    if (clientPhotoFile) {
      try {
        const cleanFileName = clientPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageRef = ref(storage, `clients/${Date.now()}_${cleanFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, clientPhotoFile);

        await new Promise<void>((resolve) => {
          uploadTask.on(
            'state_changed',
            () => {},
            (error) => {
              console.warn("Storage upload failed, falling back to local image data:", error);
              if (clientPhotoPreview) {
                finalLogoUrl = clientPhotoPreview;
              }
              resolve();
            },
            async () => {
              try {
                finalLogoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              } catch (e) {
                if (clientPhotoPreview) finalLogoUrl = clientPhotoPreview;
              }
              resolve();
            }
          );
        });
      } catch (uploadErr) {
        console.warn("Erro no upload da foto do cliente:", uploadErr);
        if (clientPhotoPreview) {
          finalLogoUrl = clientPhotoPreview;
        }
      }
    } else if (clientPhotoPreview) {
      finalLogoUrl = clientPhotoPreview;
    }

    try {
      if (editingClient) {
        updateClient(editingClient.id, {
          name: trimmedName,
          email: newClientEmail.trim() || undefined,
          company: newClientCompany.trim() || undefined,
          phone: newClientPhone.trim() || undefined,
          instagram: newClientInstagram.trim() || undefined,
          logoUrl: finalLogoUrl || ''
        });
      } else {
        await addClient({
          name: trimmedName,
          email: newClientEmail.trim() || undefined,
          company: newClientCompany.trim() || undefined,
          phone: newClientPhone.trim() || undefined,
          instagram: newClientInstagram.trim() || undefined,
          logoUrl: finalLogoUrl || ''
        });
      }
      setRealClients(getClients());
      setNewClientName('');
      setNewClientEmail('');
      setNewClientCompany('');
      setNewClientPhone('');
      setNewClientInstagram('');
      setNewClientLogo('');
      setClientPhotoFile(null);
      setClientPhotoPreview(null);
      setEditingClient(null);
      setIsCreatingClient(false);
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err);
      if (err?.code === 'permission-denied' || err?.message?.includes("insufficient permissions")) {
        setClientSaveFeedback("PERMISSION_DENIED");
        setFirestorePermissionError(true);
      } else {
        setClientSaveFeedback(err?.message || "Erro ao salvar cliente no banco de dados.");
      }
    } finally {
      setIsSavingClient(false);
    }
  };

  const pieData = [
    { name: 'Imobiliário', value: realProjects.filter(p => p.category === 'Imobiliário').length, color: '#3B82F6' },
    { name: 'Eventos', value: realProjects.filter(p => p.category === 'Eventos' || p.category === 'Institucional').length, color: '#10B981' },
    { name: 'Publicitário', value: realProjects.filter(p => p.category === 'Publicitário' || p.category === 'Publicidade').length, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const [firestorePermissionError, setFirestorePermissionError] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    setRealProjects(getProjects());
    
    const handleUpdate = () => {
      setRealProjects(getProjects());
    };

    const handleFirestoreError = () => {
      setFirestorePermissionError(true);
    };

    window.addEventListener("projects-updated", handleUpdate);
    window.addEventListener("firestore-permission-error", handleFirestoreError);
    return () => {
      window.removeEventListener("projects-updated", handleUpdate);
      window.removeEventListener("firestore-permission-error", handleFirestoreError);
    };
  }, []);

  // Preload all project thumbnails into browser memory cache so navigation between pages and tabs is 100% instant
  useEffect(() => {
    if (realProjects.length > 0) {
      realProjects.forEach((p) => {
        if (p.thumbnail && p.thumbnail.startsWith('http')) {
          const img = new Image();
          img.decoding = 'async';
          img.src = p.thumbnail;
        }
      });
    }
  }, [realProjects]);

  const handleSort = () => {
    if (draggedItemIdRef.current && dragOverItemIdRef.current && draggedItemIdRef.current !== dragOverItemIdRef.current) {
      const newItems = [...menuItems];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItemIdRef.current);
      const overIndex = newItems.findIndex(item => item.id === dragOverItemIdRef.current);
      
      if (draggedIndex !== -1 && overIndex !== -1) {
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(overIndex, 0, draggedItem);
        setMenuItems(newItems);
        try {
          localStorage.setItem('animasystem_menu_items_order', JSON.stringify(newItems.map(i => i.id)));
        } catch (e) {
          console.error("Error saving menu order", e);
        }
      }
    }
    draggedItemIdRef.current = null;
    dragOverItemIdRef.current = null;
  };

  const toggleMenuVisibility = (id: string) => {
    const newSet = new Set(visibleMenuIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleMenuIds(newSet);
    try {
      localStorage.setItem('animasystem_visible_menu_ids', JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.error("Error saving visible menu items", e);
    }
  };

  const imobiliarioProjects = realProjects.filter(p => (p.category || '').toLowerCase().includes('imobil'));
  const publicidadeProjects = realProjects.filter(p => (p.category || '').toLowerCase().includes('publi'));
  const eventosProjects = realProjects.filter(p => (p.category || '').toLowerCase().includes('event') || (p.category || '').toLowerCase().includes('instituc'));

  // Filtered projects for the projects view (mais recentes primeiro)
  const filteredProjects = sortProjectsByRecent(realProjects).filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      p.title.toLowerCase().includes(q) ||
      ((p as any).client || p.clientId || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    
    if (!matchesSearch) return false;
    if (projectCategoryFilter === 'Todas') return true;
    if (projectCategoryFilter === 'Imobiliário') return (p.category || '').toLowerCase().includes('imobil');
    if (projectCategoryFilter === 'Publicitário' || projectCategoryFilter === 'Publicidade') return (p.category || '').toLowerCase().includes('publi');
    if (projectCategoryFilter === 'Eventos' || projectCategoryFilter === 'Institucional') return (p.category || '').toLowerCase().includes('event') || (p.category || '').toLowerCase().includes('instituc');
    return true;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategory(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t.dashboard;
      case 'clients': return t.manageClients;
      case 'notes': return lang === 'pt' ? 'Bloco de Notas' : 'Notes';
      case 'files': return lang === 'pt' ? 'Gerenciador de Arquivos' : 'Files Manager';
      case 'chats': return lang === 'pt' ? 'Conversas' : 'Chats';
      case 'mail': return lang === 'pt' ? 'Caixa de E-mail' : 'Email';
      case 'calendar': return lang === 'pt' ? 'Calendário' : 'Calendar';
      case 'knowledgeBase': return lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base';
      case 'messenger': return lang === 'pt' ? 'Mensagens' : 'Messages';
      case 'settings': return lang === 'pt' ? 'Configurações' : 'Settings';
      case 'learn': return lang === 'pt' ? 'Aprender' : 'Learn';
      case 'helpCenter': return lang === 'pt' ? 'Central de Ajuda' : 'Help Center';
      case 'support': return lang === 'pt' ? 'Suporte' : 'Support';
      default: return t.allProjects;
    }
  };

  const getHeaderDesc = () => {
    switch (activeTab) {
      case 'dashboard': return t.overviewDesc;
      case 'clients': return t.manageClientsDesc;
      case 'notes': return lang === 'pt' ? 'Crie notas rápidas, roteiros, checklists e briefings de projetos.' : 'Create quick notes, scripts, checklists, and project briefs.';
      case 'files': return lang === 'pt' ? 'Armazene e gerencie mídias, contratos, arquivos RAW e exportações.' : 'Store and manage media, contracts, RAW files, and exports.';
      case 'chats': return lang === 'pt' ? 'Canais de atendimento em tempo real com clientes e membros de equipe.' : 'Real-time client support and team communication channels.';
      case 'mail': return lang === 'pt' ? 'Gerencie envio de propostas, notificações e trocas com produtoras.' : 'Manage proposals, client approvals, and outreach.';
      case 'calendar': return lang === 'pt' ? 'Planejamento de diárias de filmagem, reuniões e datas de entrega.' : 'Schedule filming dates, client review meetings, and release deadlines.';
      case 'knowledgeBase': return lang === 'pt' ? 'Documentação interna de pipelines, padrões de câmera, codecs e fluxos.' : 'Internal documentation on camera profiles, export presets, and workflows.';
      case 'messenger': return lang === 'pt' ? 'Envie comunicados e mensagens rápidas para seus clientes e colaboradores.' : 'Direct broadcast messages and chat with clients and production team.';
      case 'settings': return lang === 'pt' ? 'Ajuste preferências de estúdio, segurança, sincronização e aparência.' : 'Customize studio preferences, cloud storage, security, and appearance.';
      case 'learn': return lang === 'pt' ? 'Workshops e tutoriais avançados em cinematografia, cor e iluminação.' : 'Workshops and tutorials in cinematography, color grading, and lighting.';
      case 'helpCenter': return lang === 'pt' ? 'Respostas para dúvidas frequentes sobre a plataforma AnimaSystem.' : 'Answers to frequently asked questions about AnimaSystem.';
      case 'support': return lang === 'pt' ? 'Abra chamados técnicos e acompanhe o status dos servidores.' : 'Submit technical support tickets and check server system health.';
      default: return t.allProjectsDesc;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#070707] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#FF6321] rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-light">Verificando autenticação...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-[#050505] text-gray-900 dark:text-[#E5E5E5] font-sans overflow-hidden w-full relative z-[100] fixed inset-0`}>
      


      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-[70px]' : 'w-[280px]'} flex-shrink-0 border-r border-gray-200 dark:border-[#1a1a1a] flex flex-col h-full bg-white dark:bg-[#0a0a0a] z-50 pb-6 hidden md:flex transition-all duration-300 relative`}>
        <div className={`h-[64px] flex-shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'} mb-4`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-wide text-black dark:text-white">AnimaSystem</span>
            </div>
          )}
          <div className="flex items-center gap-2 relative">
            {!isSidebarCollapsed && (
              <div ref={menuConfigRef} className="relative">
                <button 
                  onClick={() => setShowMenuConfig(!showMenuConfig)}
                  className="text-gray-500 dark:text-[#666] hover:text-black dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#111] p-1.5 rounded-md border border-gray-200 dark:border-[#222]"
                  title="Configurar Menus"
                >
                  <Settings size={14} />
                </button>

                {showMenuConfig && (
                  <div className="absolute top-8 left-0 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg p-3 z-[60]">
                    <h4 className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase mb-2">Visibilidade</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                      {menuItems.map(item => (
                        <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={visibleMenuIds.has(item.id)} 
                            onChange={() => toggleMenuVisibility(item.id)}
                            className="rounded border-gray-300 dark:border-[#444] text-black dark:text-white bg-gray-100 dark:bg-[#111] accent-black dark:accent-white"
                          />
                          <span className="text-[13px] text-gray-600 dark:text-[#ccc] group-hover:text-black dark:group-hover:text-white transition-colors">{(t as any)[item.labelKey] || item.labelKey}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-500 dark:text-[#666] hover:text-black dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#111] p-1.5 rounded-md border border-gray-200 dark:border-[#222]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={!isSidebarCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'}><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
            </button>
          </div>
        </div>

        <div className="px-3 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start">
          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 mb-2 text-[11px] font-bold text-gray-500 dark:text-[#555555] uppercase tracking-wider">{t.navigate}</h4>}
            {isSidebarCollapsed && <div className="h-4"></div>}
            <div className="space-y-1">
              {menuItems.filter(item => item.section === 'main' && visibleMenuIds.has(item.id)).map((item) => {
                const isProjects = item.id === 'projects';
                
                return (
                  <div key={item.id} className="w-full">
                    <div className="relative flex items-center">
                      <NavItem 
                        icon={iconMap[item.iconName]} 
                        label={(t as any)[item.labelKey] || item.labelKey} 
                        active={activeTab === item.id && !editingProject} 
                        disabled={item.disabled}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsCreating(false);
                          setEditingProject(null);
                          if (item.id === 'projects') setCurrentPage(1);
                        }} 
                        collapsed={isSidebarCollapsed}
                        draggable={!isSidebarCollapsed}
                        onDragStart={() => (draggedItemIdRef.current = item.id)}
                        onDragOver={(e: any) => { e.preventDefault(); dragOverItemIdRef.current = item.id; }}
                        onDrop={handleSort}
                      />
                      {isProjects && !isSidebarCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectsTreeOpen(!projectsTreeOpen);
                          }}
                          className="absolute right-2 p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
                          title="Recolher/Expandir coleções"
                        >
                          <ChevronDown size={14} className={`transition-transform duration-200 ${projectsTreeOpen ? '' : '-rotate-90'}`} />
                        </button>
                      )}
                    </div>

                    {/* Expandable Collections Tree: PROJETOS > IMOBILIARIO / PUBLICIDADE / EVENTOS > PROJETOS */}
                    {isProjects && !isSidebarCollapsed && projectsTreeOpen && (
                      <div className="mt-1 ml-3 pl-2 border-l border-gray-200 dark:border-[#222] space-y-1.5 py-1">
                        {/* 1. IMOBILIÁRIO */}
                        <div>
                          <div className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors group">
                            <button
                              onClick={() => {
                                toggleCategoryExpand('Imobiliário');
                                setProjectCategoryFilter('Imobiliário');
                                setActiveTab('projects');
                                setIsCreating(false);
                                setEditingProject(null);
                              }}
                              className="flex items-center gap-1.5 flex-1 text-left"
                            >
                              <ChevronRight size={12} className={`transition-transform text-gray-400 ${expandedCategory['Imobiliário'] ? 'rotate-90' : ''}`} />
                              <span className="tracking-wide uppercase text-[11px] font-bold text-blue-600 dark:text-blue-400">Imobiliário</span>
                              <span className="text-[10px] text-gray-400 font-mono">({imobiliarioProjects.length})</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('projects');
                                setNewProjectCategory('Imobiliário');
                                setEditingProject(null);
                                setIsCreating(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-opacity"
                              title="Novo projeto Imobiliário"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {expandedCategory['Imobiliário'] && (
                            <div className="ml-3 pl-2 border-l border-gray-200/60 dark:border-[#222] space-y-0.5 mt-0.5">
                              {imobiliarioProjects.map(proj => (
                                <button
                                  key={proj.id}
                                  onClick={() => {
                                    setActiveTab('projects');
                                    setEditingProject(proj);
                                    setIsCreating(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors flex items-center gap-1.5 ${
                                    editingProject?.id === proj.id 
                                      ? 'bg-blue-500/15 text-blue-500 font-bold' 
                                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161616]'
                                  }`}
                                  title={`PROJETOS > IMOBILIÁRIO > ${proj.title}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                  <span className="truncate">{proj.title}</span>
                                </button>
                              ))}
                              {imobiliarioProjects.length === 0 && (
                                <span className="text-[10px] text-gray-400 italic px-2 py-0.5 block">Nenhum projeto</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. PUBLICIDADE */}
                        <div>
                          <div className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors group">
                            <button
                              onClick={() => {
                                toggleCategoryExpand('Publicidade');
                                setProjectCategoryFilter('Publicitário');
                                setActiveTab('projects');
                                setIsCreating(false);
                                setEditingProject(null);
                              }}
                              className="flex items-center gap-1.5 flex-1 text-left"
                            >
                              <ChevronRight size={12} className={`transition-transform text-gray-400 ${expandedCategory['Publicidade'] ? 'rotate-90' : ''}`} />
                              <span className="tracking-wide uppercase text-[11px] font-bold text-amber-600 dark:text-amber-400">Publicidade</span>
                              <span className="text-[10px] text-gray-400 font-mono">({publicidadeProjects.length})</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('projects');
                                setNewProjectCategory('Publicitário');
                                setEditingProject(null);
                                setIsCreating(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-opacity"
                              title="Novo projeto Publicitário"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {expandedCategory['Publicidade'] && (
                            <div className="ml-3 pl-2 border-l border-gray-200/60 dark:border-[#222] space-y-0.5 mt-0.5">
                              {publicidadeProjects.map(proj => (
                                <button
                                  key={proj.id}
                                  onClick={() => {
                                    setActiveTab('projects');
                                    setEditingProject(proj);
                                    setIsCreating(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors flex items-center gap-1.5 ${
                                    editingProject?.id === proj.id 
                                      ? 'bg-amber-500/15 text-amber-500 font-bold' 
                                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161616]'
                                  }`}
                                  title={`PROJETOS > PUBLICIDADE > ${proj.title}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                  <span className="truncate">{proj.title}</span>
                                </button>
                              ))}
                              {publicidadeProjects.length === 0 && (
                                <span className="text-[10px] text-gray-400 italic px-2 py-0.5 block">Nenhum projeto</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. EVENTOS */}
                        <div>
                          <div className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors group">
                            <button
                              onClick={() => {
                                toggleCategoryExpand('Eventos');
                                setProjectCategoryFilter('Eventos');
                                setActiveTab('projects');
                                setIsCreating(false);
                                setEditingProject(null);
                              }}
                              className="flex items-center gap-1.5 flex-1 text-left"
                            >
                              <ChevronRight size={12} className={`transition-transform text-gray-400 ${expandedCategory['Eventos'] ? 'rotate-90' : ''}`} />
                              <span className="tracking-wide uppercase text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Eventos</span>
                              <span className="text-[10px] text-gray-400 font-mono">({eventosProjects.length})</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('projects');
                                setNewProjectCategory('Eventos');
                                setEditingProject(null);
                                setIsCreating(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-opacity"
                              title="Novo projeto de Eventos"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {expandedCategory['Eventos'] && (
                            <div className="ml-3 pl-2 border-l border-gray-200/60 dark:border-[#222] space-y-0.5 mt-0.5">
                              {eventosProjects.map(proj => (
                                <button
                                  key={proj.id}
                                  onClick={() => {
                                    setActiveTab('projects');
                                    setEditingProject(proj);
                                    setIsCreating(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors flex items-center gap-1.5 ${
                                    editingProject?.id === proj.id 
                                      ? 'bg-emerald-500/15 text-emerald-500 font-bold' 
                                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161616]'
                                  }`}
                                  title={`PROJETOS > EVENTOS > ${proj.title}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                  <span className="truncate">{proj.title}</span>
                                </button>
                              ))}
                              {eventosProjects.length === 0 && (
                                <span className="text-[10px] text-gray-400 italic px-2 py-0.5 block">Nenhum projeto</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 mb-2 text-[11px] font-bold text-gray-500 dark:text-[#555555] uppercase tracking-wider">{t.more}</h4>}
            {isSidebarCollapsed && <div className="h-4"></div>}
            <div className="space-y-1">
              {menuItems.filter(item => item.section === 'more' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem key={item.id} 
                  icon={iconMap[item.iconName]} 
                  label={(t as any)[item.labelKey] || item.labelKey} 
                  active={activeTab === item.id} 
                  disabled={item.disabled}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsCreating(false);
                    setEditingProject(null);
                  }} 
                  collapsed={isSidebarCollapsed}
                  draggable={!isSidebarCollapsed}
                  onDragStart={() => (draggedItemIdRef.current = item.id)}
                  onDragOver={(e: any) => { e.preventDefault(); dragOverItemIdRef.current = item.id; }}
                  onDrop={handleSort}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-100 dark:bg-[#050505]">
        
        {/* Top Header Collapsible wrapper */}
        {isNavbarCollapsed ? (
          <div className="flex justify-center -mb-4 z-30 relative top-0">
             <button onClick={() => setIsNavbarCollapsed(false)} className="bg-white dark:bg-[#1a1a1a] border border-t-0 border-gray-200 dark:border-[#222] px-4 py-1 rounded-b-xl shadow-md text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white transition-colors">
               <ChevronDown size={16} />
             </button>
          </div>
        ) : (
          <header className="h-[64px] flex-shrink-0 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between px-4 md:px-8 bg-white dark:bg-[#0a0a0a] transition-all relative z-30">
            
            <div className="flex items-center gap-6">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#777]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t.search} 
                  className="w-[150px] lg:w-[220px] bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#222] text-[13px] text-gray-900 dark:text-white rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-gray-300 dark:focus:border-[#444] transition-colors" 
                />
              </div>
  
              <nav className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-gray-500 dark:text-[#888]">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsCreating(false);
                    setEditingProject(null);
                  }}
                  className={`hover:text-gray-900 dark:hover:text-white transition-colors ${activeTab === 'dashboard' ? 'text-gray-900 dark:text-white' : ''}`}
                >
                  {t.dashboard}
                </button>
                {activeTab !== 'dashboard' && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">/</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {(t as any)[activeTab] || activeTab}
                    </span>
                  </>
                )}
              </nav>
            </div>
  
            <div className="flex items-center gap-2 md:gap-4 relative">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500 dark:text-[#777] hover:text-gray-900 dark:hover:text-white transition-colors">
                {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </button>
              
              <button className="text-gray-500 dark:text-[#777] hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">
                <Settings size={18} strokeWidth={2} />
              </button>
              
              {/* Notification Button */}
              <div className="relative" ref={notificationsRef}>
                <button onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markNotificationsAsRead();
                    setNotifications(getNotifications()); // update locally immediately
                  }
                }} className="text-gray-500 dark:text-[#777] hover:text-gray-900 dark:hover:text-white transition-colors relative">
                  <Bell size={18} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#0a0a0a]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg p-4 z-[60]">
                    <h4 className="text-[13px] font-bold text-black dark:text-white mb-3">Notificações</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-[12px] text-gray-500 text-center py-4">Nenhuma notificação</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={`text-[12px] p-2 rounded-lg ${!notif.read ? 'bg-gray-50 dark:bg-[#222]' : ''}`}>
                            <div className="text-gray-600 dark:text-[#aaa]">
                              <span className="font-bold text-black dark:text-white">Novo comentário</span> em <span className="font-semibold text-black dark:text-[#ccc]">{notif.projectName}</span>
                            </div>
                            <p className="text-gray-500 dark:text-[#888] italic mt-1 border-l-2 border-gray-300 dark:border-[#444] pl-2 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-gray-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={profileMenuRef}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-[#333] overflow-hidden ml-1 flex-shrink-0 cursor-pointer"
                  title={currentUser?.email || "Admin"}
                >
                   <img 
                     src={currentUser?.photoURL || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150"} 
                     alt="User Avatar" 
                     className="w-full h-full object-cover" 
                     referrerPolicy="no-referrer"
                   />
                </div>

                {showProfileMenu && (
                  <div className="absolute right-0 top-10 w-44 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1.5 z-[60]">
                    <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] mb-1">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                        {currentUser?.displayName || 'Daniel Vale'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {currentUser?.email}
                      </p>
                    </div>

                    <RouterLink
                      to="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 text-[12px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> {t.backToSite}
                    </RouterLink>

                    <div className="border-t border-gray-100 dark:border-[#2a2a2a] my-0.5" />

                    <button 
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await signOut(auth);
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] font-bold text-red-500 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} /> {t.logout}
                    </button>
                  </div>
                )}
              </div>
              
              <button onClick={() => setIsNavbarCollapsed(true)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#222] transition-colors ml-1 hidden sm:flex">
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </header>
        )}

        {/* Normal Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-10 pt-10 flex-1 w-full flex flex-col overflow-y-auto no-scrollbar">
            
            {(isCreating || editingProject) ? (
              <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#222] p-6 sm:p-8 flex-1 shadow-sm relative mb-6">
                {/* Hierarchical Breadcrumb Header requested by user: PROJETOS > IMOBILIÁRIO > CASA ALPHAVILLE */}
                <div className="mb-6 pb-4 border-b border-gray-100 dark:border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider flex-wrap">
                    <span className="font-bold text-gray-400">PROJETOS</span>
                    <span>&gt;</span>
                    <span className="font-bold text-blue-500">{((newProjectCategory || editingProject?.category) || 'IMOBILIÁRIO').toUpperCase()}</span>
                    <span>&gt;</span>
                    <span className="font-bold text-black dark:text-white">{editingProject?.title?.toUpperCase() || 'NOVO PROJETO'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingProject(null);
                      setNewProjectCategory(null);
                    }}
                    className="text-xs text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} /> Voltar à lista
                  </button>
                </div>

                <ProjectForm 
                  project={editingProject} 
                  initialCategory={newProjectCategory || editingProject?.category}
                  onSave={handleSaveProject} 
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                    setNewProjectCategory(null);
                  }}
                  onDelete={(project) => {
                    setProjectToDelete(project);
                    setIsDeleteModalOpen(true);
                  }}
                  onNavigateToClients={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                    setActiveTab('clients');
                  }}
                  lang={lang}
                />
              </div>
            ) : (
              <>
            {/* Firestore Permission Warning Banner */}
            {firestorePermissionError && (
              <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex flex-col items-start justify-between gap-4 shadow-sm">
                <div className="text-[13px] space-y-2 flex-1 w-full">
                  <div className="font-bold flex items-center gap-2 text-base text-amber-700 dark:text-amber-300">
                    <AlertCircle size={18} />
                    Liberar Gravação no Firebase Console (Cloud Firestore)
                  </div>
                  <p className="text-gray-700 dark:text-[#ccc] leading-relaxed">
                    O Firebase Console bloqueou as gravações por falta de permissão (<code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-black dark:text-white font-mono text-xs">PERMISSION_DENIED</code>). Para que todos os clientes, projetos e mensagens entrem no banco de dados, siga estes 3 passos simples:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-[#bbb] pl-1 font-medium text-xs">
                    <li>Na tela do Firebase Console aberta, clique na aba <strong className="text-black dark:text-white">Regras</strong> (ao lado de <em>Dados</em>).</li>
                    <li>Substitua o conteúdo pelo código abaixo e clique em <strong className="text-black dark:text-white">Publicar</strong>.</li>
                    <li>Volte aqui e clique em <strong className="text-black dark:text-white">"Sincronizar Tudo"</strong>.</li>
                  </ol>
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl font-mono text-[11px] text-gray-800 dark:text-gray-200 overflow-x-auto select-all border border-black/10 dark:border-white/10">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                        navigator.clipboard.writeText(rules);
                        setCopiedRules(true);
                        setTimeout(() => setCopiedRules(false), 3000);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
                    >
                      <Copy size={14} />
                      {copiedRules ? "Regras Copiadas!" : "Copiar Regras Prontas"}
                    </button>
                    <a
                      href="https://console.firebase.google.com/project/danielvalevm/firestore/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold text-xs hover:bg-amber-500/10 transition-colors"
                    >
                      <Globe size={14} />
                      Abrir Aba Regras no Firebase
                    </a>
                    <button
                      onClick={handleSyncAll}
                      disabled={isSyncingFirestore}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Cloud size={14} className={isSyncingFirestore ? "animate-pulse" : ""} />
                      {isSyncingFirestore ? "Testando e Sincronizando..." : "Testar e Sincronizar Agora"}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setFirestorePermissionError(false)} 
                  className="text-gray-400 hover:text-black dark:hover:text-white text-xs font-semibold p-1.5 rounded transition-colors self-start"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Sync Feedback Toast / Banner */}
            {syncStatus && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
                syncStatus.success 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  {syncStatus.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{syncStatus.message}</span>
                </div>
                <button onClick={() => setSyncStatus(null)} className="opacity-70 hover:opacity-100 p-1 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
                  {getHeaderTitle()}
                </h1>
                <p className="text-gray-500 dark:text-[#777] text-[13px] font-medium">
                  {getHeaderDesc()}
                </p>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">


                {activeTab === 'projects' && (
                  <>
                    <div className="hidden sm:flex items-center bg-white dark:bg-[#111111] rounded-full p-1 border border-gray-200 dark:border-[#222]">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 ${viewMode === 'grid' ? 'bg-black text-white dark:bg-[#222] dark:text-white' : 'text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white'}`}
                      >
                        <LayoutGrid size={14} /> {t.gridView}
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-black text-white dark:bg-[#222] dark:text-white' : 'text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white'}`}
                      >
                        <Folder size={14} /> {t.listView}
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setNewProjectCategory(projectCategoryFilter !== 'Todas' ? projectCategoryFilter : 'Imobiliário');
                        setIsCreating(true);
                      }}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Plus size={16} /> {t.addProject}
                    </button>
                  </>
                )}

                {activeTab === 'clients' && (
                  <button 
                    onClick={() => setIsCreatingClient(true)}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Plus size={16} /> {lang === 'pt' ? 'Adicionar Cliente' : 'Add Client'}
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            {activeTab === 'clients' ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {realClients.length === 0 ? (
                  <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm h-full min-h-[400px]">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                      <Briefcase size={32} className="text-gray-400 dark:text-[#555]" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-6">Nenhum cliente cadastrado</h3>
                    <button 
                      onClick={() => setIsCreatingClient(true)}
                      className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Plus size={16} /> Adicionar Primeiro Cliente
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 content-start pb-6">
                    {realClients.map(client => (
                      <div key={client.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 flex flex-col items-center relative shadow-sm hover:border-gray-300 dark:hover:border-[#333] transition-all group">
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title={lang === 'pt' ? 'Editar cliente' : 'Edit client'}
                            aria-label={lang === 'pt' ? 'Editar cliente' : 'Edit client'}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setClientToDelete(client);
                              setIsDeleteClientModalOpen(true);
                            }}
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title={lang === 'pt' ? 'Excluir cliente' : 'Delete client'}
                            aria-label={lang === 'pt' ? 'Excluir cliente' : 'Delete client'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-3 border border-gray-200 dark:border-[#333] shadow-inner">
                           {client.logoUrl?.trim() ? (
                             <img src={client.logoUrl.trim()} alt={client.name} className="w-full h-full object-cover" />
                           ) : (
                             <User size={32} className="text-gray-400" />
                           )}
                        </div>
                        <h4 className="font-bold text-[15px] text-gray-900 dark:text-white text-center truncate w-full">{client.name}</h4>
                        {client.company && (
                          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF6321] text-[11px] font-bold max-w-full truncate flex items-center gap-1">
                            <Building2 size={11} className="flex-shrink-0" />
                            <span className="truncate">{client.company}</span>
                          </div>
                        )}
                        {client.email && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center truncate w-full mt-1.5 flex items-center justify-center gap-1.5">
                            <Mail size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center truncate w-full mt-1 flex items-center justify-center gap-1.5">
                            <Phone size={11} className="text-emerald-500 flex-shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </p>
                        )}
                        {client.instagram && (
                          <p className="text-[11px] text-pink-500 text-center truncate w-full mt-1 flex items-center justify-center gap-1.5 font-medium">
                            <Instagram size={11} className="flex-shrink-0" />
                            <span className="truncate">{client.instagram.startsWith('@') || client.instagram.includes('/') ? client.instagram : `@${client.instagram}`}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="flex flex-col lg:flex-row gap-6 h-full pb-8">
                <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm min-h-[400px]">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t.projectsOverview}</h3>
                  <p className="text-gray-500 dark:text-[#777] text-[13px] mb-8">{t.overviewDesc}</p>
                  
                  {pieData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff', border: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000' }}
                            itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                          />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#888' : '#555' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-[#555] font-medium text-[13px]">
                      {t.noProjects}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 h-full content-start">
                   <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                     <span className="text-4xl font-bold text-black dark:text-white mb-2">{realProjects.length}</span>
                     <span className="text-gray-500 dark:text-[#777] text-[13px] uppercase tracking-wider font-bold">{t.totalProjects}</span>
                   </div>
                   <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                     <span className="text-4xl font-bold text-[#EAB308] mb-2">{realProjects.filter(p => p.isFavorite).length}</span>
                     <span className="text-gray-500 dark:text-[#777] text-[13px] uppercase tracking-wider font-bold">{t.favorites}</span>
                   </div>
                   <div className="col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                     <span className="text-4xl font-bold text-[#3B82F6] mb-2">{realProjects.reduce((acc, curr) => acc + (curr.views || 0), 0)}</span>
                     <span className="text-gray-500 dark:text-[#777] text-[13px] uppercase tracking-wider font-bold">{t.totalViews}</span>
                   </div>
                   <div className="col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-6 shadow-sm flex items-center gap-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors" onClick={() => { setActiveTab('projects'); setCurrentPage(1); }}>
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                         <Folder size={24} className="text-gray-500 dark:text-[#888]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-black dark:text-white font-bold text-[15px] mb-1">{t.managePortfolio}</h3>
                        <p className="text-gray-500 dark:text-[#777] text-[13px]">{t.manageDesc}</p>
                      </div>
                   </div>
                </div>
              </div>
            ) : activeTab === 'notes' ? (
              <NotesTab lang={lang} />
            ) : activeTab === 'files' ? (
              <FilesTab lang={lang} />
            ) : activeTab === 'chats' ? (
              <ConversasTab lang={lang} />
            ) : activeTab === 'mail' ? (
              <EmailTab lang={lang} />
            ) : activeTab === 'calendar' ? (
              <CalendarTab lang={lang} />
            ) : activeTab === 'knowledgeBase' ? (
              <KnowledgeBaseTab lang={lang} />
            ) : activeTab === 'messenger' ? (
              <MessagesTab lang={lang} />
            ) : activeTab === 'settings' ? (
              <SettingsTab lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
            ) : activeTab === 'learn' ? (
              <LearnTab lang={lang} />
            ) : activeTab === 'helpCenter' ? (
              <HelpCenterTab lang={lang} onNavigateToSupport={() => setActiveTab('support')} />
            ) : activeTab === 'support' ? (
              <SupportTab lang={lang} />
            ) : null}

            {/* Tab Projetos: Mantida montada com alternância de visibilidade para que miniaturas e DOM permaneçam cacheados */}
            <div className={`flex-1 flex-col h-full overflow-hidden ${activeTab === 'projects' ? 'flex' : 'hidden'}`}>
              <div className={`flex-1 ${viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 content-start items-start" : "flex flex-col gap-3"} overflow-y-auto no-scrollbar pb-4`}>
                {filteredProjects.map((project, idx) => {
                  const pageIndex = Math.floor(idx / itemsPerPage) + 1;
                  const isVisible = pageIndex === currentPage;
                  const projectNotes = notes.filter(n => n.projectId === project.id || n.projectName === project.title);

                  return (
                    <Card 
                      key={project.id} 
                      project={project}
                      viewMode={viewMode}
                      isSelected={selectedProjectIds.has(project.id)}
                      isVisible={isVisible}
                      notesCount={projectNotes.length}
                      onToggleSelect={(e) => handleToggleSelect(project.id, e)}
                      onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
                      onClick={() => setEditingProject(project)}
                      onActionClick={handleActionClick}
                      onAddNote={(proj) => setNoteModalProject(proj)}
                      onCopyLinkFeedback={handleCopyFeedback}
                      onUpdateVisibility={handleUpdateProjectVisibility}
                    />
                  );
                })}
                {filteredProjects.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center h-full text-gray-500 dark:text-[#777] min-h-[260px] border border-dashed border-gray-200 dark:border-[#222] rounded-3xl p-8 bg-gray-50/50 dark:bg-[#151515]/30">
                     <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-4 text-gray-400">
                       <Folder size={28} />
                     </div>
                     <h3 className="text-lg font-bold text-black dark:text-white mb-1">Nenhum projeto cadastrado</h3>
                     <p className="text-xs text-gray-500 dark:text-[#777] mb-6 text-center max-w-sm">
                       Os projetos fictícios foram limpos. Clique no botão abaixo para adicionar seu primeiro trabalho real.
                     </p>
                     <button
                       onClick={() => setIsCreating(true)}
                       className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm"
                     >
                       <Plus size={16} /> {t.addProject}
                     </button>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center w-full pb-6 gap-6 flex-shrink-0">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] flex items-center justify-center text-gray-500 dark:text-[#777] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${currentPage === idx + 1 ? 'border border-gray-300 dark:border-[#222] bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm' : 'border border-transparent text-gray-500 dark:text-[#777] hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] flex items-center justify-center text-gray-500 dark:text-[#777] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            </>
            )}
            
            {/* Footer */}
            <footer className="py-6 mt-auto flex-shrink-0 flex flex-col xl:flex-row items-center justify-between text-gray-500 dark:text-[#666] text-[11px] font-medium gap-6 border-t border-gray-200 dark:border-[#1a1a1a]">
              <p>© 2026 <a href="https://animasystem.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">AnimaSystem</a></p>
              
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-5">
                  <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors font-bold text-[13px]">f</span>
                  <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors font-bold text-[13px]">X</span>
                  <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors font-bold text-[13px]">ig</span>
                  <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors font-bold text-[13px]">p</span>
                </div>
                
                <div className="relative" ref={langMenuRef}>
                  <div 
                    onClick={() => setShowLangMenu(!showLangMenu)} 
                    className="flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] px-4 py-2 rounded-full cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-[#333] transition-colors text-gray-600 dark:text-[#999]"
                  >
                    <span>{lang === 'pt' ? t.ptLanguage : t.language}</span>
                    <ChevronUp size={14} className={`${showLangMenu ? 'rotate-180' : ''} transition-transform`} />
                  </div>
                  
                  {showLangMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
                      <button 
                        onClick={() => { setLang('pt'); setShowLangMenu(false); }} 
                        className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#222] transition-colors text-black dark:text-white"
                      >
                        Português (Brasil)
                      </button>
                      <button 
                        onClick={() => { setLang('en'); setShowLangMenu(false); }} 
                        className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-100 dark:hover:bg-[#222] transition-colors text-black dark:text-white"
                      >
                        English Language
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
{/* Create Client Modal */}
      {isCreatingClient && (
        <div className="absolute inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
              </h3>
              <button
                onClick={() => {
                  if (!isSavingClient) {
                    setIsCreatingClient(false);
                    setEditingClient(null);
                    setClientSaveFeedback(null);
                    setNewClientName('');
                    setNewClientEmail('');
                    setNewClientCompany('');
                    setNewClientPhone('');
                    setNewClientInstagram('');
                    setNewClientLogo('');
                    setClientPhotoFile(null);
                    setClientPhotoPreview(null);
                  }
                }}
                disabled={isSavingClient}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {clientSaveFeedback && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400">
                {clientSaveFeedback === "PERMISSION_DENIED" ? (
                  <div className="space-y-2">
                    <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <AlertCircle size={15} />
                      O Firebase Console bloqueou a gravação (PERMISSION_DENIED)
                    </p>
                    <p className="text-gray-700 dark:text-[#bbb] leading-relaxed">
                      Na aba <strong>Regras</strong> do seu Firebase Console (ao lado de <em>Dados</em>), publique as regras abaixo para liberar gravações no banco:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                          navigator.clipboard.writeText(rules);
                          setCopiedRules(true);
                          setTimeout(() => setCopiedRules(false), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Copy size={13} />
                        {copiedRules ? "Regras Copiadas!" : "Copiar Regras Prontas"}
                      </button>
                      <a
                        href="https://console.firebase.google.com/project/danielvalevm/firestore/rules"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-semibold flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Globe size={13} />
                        Abrir Aba Regras
                      </a>
                    </div>
                  </div>
                ) : (
                  clientSaveFeedback
                )}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* 1. Nome do Cliente */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1.5 block">
                  Nome do Cliente <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors text-sm"
                  placeholder="Ex: Carlos Eduardo"
                  autoFocus
                  disabled={isSavingClient}
                />
              </div>

              {/* 2. Email */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input 
                  type="email" 
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors text-sm"
                  placeholder="Ex: carlos@empresa.com"
                  disabled={isSavingClient}
                />
              </div>

              {/* 3. Empresa */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1.5 block">
                  Empresa
                </label>
                <input 
                  type="text" 
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors text-sm"
                  placeholder="Ex: Construtora Alfa / Prime Empreendimentos"
                  disabled={isSavingClient}
                />
              </div>

              {/* 4. Telefone / WhatsApp */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1.5 block">
                  Telefone / WhatsApp
                </label>
                <input 
                  type="tel" 
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors text-sm"
                  placeholder="Ex: (11) 99999-9999"
                  disabled={isSavingClient}
                />
              </div>

              {/* 5. Instagram */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1.5 block">
                  Instagram
                </label>
                <input 
                  type="text" 
                  value={newClientInstagram}
                  onChange={(e) => setNewClientInstagram(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors text-sm"
                  placeholder="Ex: @corretor ou perfil"
                  disabled={isSavingClient}
                />
              </div>

              {/* 6. Enviar Foto do PC */}
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-2 block flex items-center justify-between">
                  <span>Foto do Cliente / Logo</span>
                  <span className="text-[11px] text-gray-400 font-normal lowercase">Do computador ou URL</span>
                </label>
                
                <input 
                  type="file" 
                  ref={clientFileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleClientPhotoSelect} 
                  disabled={isSavingClient}
                />

                {clientPhotoPreview ? (
                  <div className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 dark:bg-[#202020] flex-shrink-0 border border-gray-300 dark:border-[#333] shadow-sm">
                      <img src={clientPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {clientPhotoFile ? clientPhotoFile.name : 'Foto selecionada'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {clientPhotoFile ? `${(clientPhotoFile.size / 1024).toFixed(1)} KB` : 'Foto pronta para salvar'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => clientFileInputRef.current?.click()}
                          disabled={isSavingClient}
                          className="text-[11px] font-bold text-[#FF6321] hover:underline cursor-pointer"
                        >
                          Trocar foto do PC
                        </button>
                        <span className="text-gray-300 dark:text-[#444]">•</span>
                        <button
                          type="button"
                          onClick={handleRemoveClientPhoto}
                          disabled={isSavingClient}
                          className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => !isSavingClient && clientFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] hover:border-[#FF6321] dark:hover:border-[#FF6321] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-[#161616]/50 group"
                  >
                    <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-[#202020] flex items-center justify-center text-gray-400 group-hover:text-[#FF6321] transition-colors mb-2 shadow-sm">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 text-center">
                      Clique para enviar foto do computador
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 text-center">
                      PNG, JPG, WebP ou SVG
                    </p>
                  </div>
                )}

                {/* Ou URL opcional */}
                <div className="mt-3">
                  <input 
                    type="url" 
                    value={newClientLogo}
                    onChange={(e) => {
                      setNewClientLogo(e.target.value);
                      if (e.target.value.trim() && !clientPhotoFile) {
                        setClientPhotoPreview(e.target.value.trim());
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#222] text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 text-xs"
                    placeholder="Ou cole a URL da imagem (opcional)"
                    disabled={isSavingClient}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#1e1e1e]">
              <button 
                onClick={() => {
                  if (!isSavingClient) {
                    setIsCreatingClient(false);
                    setEditingClient(null);
                    setClientSaveFeedback(null);
                    setNewClientName('');
                    setNewClientEmail('');
                    setNewClientCompany('');
                    setNewClientPhone('');
                    setNewClientInstagram('');
                    setNewClientLogo('');
                    setClientPhotoFile(null);
                    setClientPhotoPreview(null);
                  }
                }}
                disabled={isSavingClient}
                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-[#222] text-gray-600 dark:text-[#ccc] text-[13px] font-bold hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClient}
                disabled={isSavingClient || !newClientName.trim()}
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isSavingClient ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {editingClient ? 'Atualizando Cliente...' : 'Salvando Cliente...'}
                  </>
                ) : (
                  editingClient ? 'Salvar Alterações' : 'Salvar Cliente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {actionModal && actionProject && (
        <div className="absolute inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <button 
              onClick={() => setActionModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">
              {actionModal === 'review' ? 'Link de Avaliação' : 'Código de Download'}
            </h3>
            <p className="text-gray-500 dark:text-[#777] text-[13px] mb-6">
              Projeto: <span className="font-bold text-gray-800 dark:text-[#ccc]">{actionProject.title}</span>
            </p>
            
            {actionModal === 'review' ? (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-[#aaa] truncate flex-1">{window.location.origin}/avaliar/{actionProject.id}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/avaliar/' + actionProject.id);
                      alert('Link copiado!');
                    }}
                    className="ml-3 text-gray-500 hover:text-black dark:hover:text-white"
                    title="Copiar Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent('Olá! Segue o link para avaliação do projeto "' + actionProject.title + '": ' + window.location.origin + '/avaliar/' + actionProject.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-black dark:bg-[#222] dark:hover:bg-[#333] dark:text-white py-3 rounded-full text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Enviar no WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl p-6 flex flex-col items-center justify-center mb-6">
                   <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-2">Código Gerado</p>
                   <div className="flex items-center justify-center gap-3">
                     <p className="text-3xl bg-[#1e3a8a] text-white px-4 py-1 rounded shadow-sm font-mono font-black tracking-[0.2em]">
                       {actionProject.downloadCode || 'N/A'}
                     </p>
                     {actionProject.downloadCode && (
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(actionProject.downloadCode);
                           // Basic feedback, could be a toast but alert is fine for now
                           alert('Código copiado com sucesso!');
                         }}
                         className="text-gray-400 hover:text-white transition-colors p-2 cursor-pointer bg-gray-200 dark:bg-[#222] rounded-full hover:bg-gray-300 dark:hover:bg-[#333]"
                         title="Copiar Código"
                       >
                         <Copy size={18} />
                       </button>
                     )}
                   </div>
                   {!actionProject.downloadCode && (
                     <p className="text-[11px] text-red-500 mt-2">Habilite o download nas edições do projeto.</p>
                   )}
                </div>
                
                {actionProject.downloadCode && (
                  <div className="flex flex-col gap-3">
                    <a 
                      href={`mailto:?subject=${encodeURIComponent('Acesso ao seu projeto: ' + actionProject.title)}&body=${encodeURIComponent('Olá, seu código de download é: ' + actionProject.downloadCode)}`}
                      className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black py-3 rounded-full text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail size={18} /> Enviar via E-mail
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent('Olá! O código de download do seu projeto "' + actionProject.title + '" é: *' + actionProject.downloadCode + '*')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-black dark:bg-[#222] dark:hover:bg-[#333] dark:text-white py-3 rounded-full text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} /> Enviar via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={lang === 'pt' ? 'Excluir Projeto' : 'Delete Project'}
        message={
          lang === 'pt'
            ? `Tem certeza que deseja excluir o projeto "${projectToDelete?.title || ''}"? Esta ação é irreversível e removerá definitivamente o projeto, seu vídeo e suas imagens do armazenamento.`
            : `Are you sure you want to delete the project "${projectToDelete?.title || ''}"? This action is irreversible and will permanently remove the project, its video and its images from storage.`
        }
        iconType="danger"
        severity="danger"
        confirmLabel={lang === 'pt' ? (isDeleting ? 'Excluindo...' : 'Excluir Projeto') : (isDeleting ? 'Deleting...' : 'Delete Project')}
        cancelLabel={lang === 'pt' ? 'Cancelar' : 'Cancel'}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
          }
        }}
      />

      {/* Delete Client Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteClientModalOpen}
        title={lang === 'pt' ? 'Excluir Cliente' : 'Delete Client'}
        message={
          lang === 'pt'
            ? `Tem certeza que deseja excluir o cliente "${clientToDelete?.name || ''}"? Esta ação removerá o cliente da listagem.`
            : `Are you sure you want to delete the client "${clientToDelete?.name || ''}"? This action will remove the client from the list.`
        }
        iconType="danger"
        severity="danger"
        confirmLabel={lang === 'pt' ? (isDeletingClient ? 'Excluindo...' : 'Excluir Cliente') : (isDeletingClient ? 'Deleting...' : 'Delete Client')}
        cancelLabel={lang === 'pt' ? 'Cancelar' : 'Cancel'}
        isLoading={isDeletingClient}
        onConfirm={handleConfirmDeleteClient}
        onCancel={() => {
          if (!isDeletingClient) {
            setIsDeleteClientModalOpen(false);
            setClientToDelete(null);
          }
        }}
      />

      {/* Project Note Modal */}
      <ProjectNoteModal
        isOpen={!!noteModalProject}
        project={noteModalProject}
        notes={noteModalProject ? notes.filter(n => n.projectId === noteModalProject.id || n.projectName === noteModalProject.title) : []}
        onClose={() => setNoteModalProject(null)}
        onSaveNote={handleSaveProjectNote}
        onDeleteNote={handleDeleteProjectNote}
        onNavigateToAllNotes={() => {
          setActiveTab('notes');
          setNoteModalProject(null);
        }}
        lang={lang}
      />

      {/* Floating Toast Notification for Link Copy */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[150] bg-gray-900 text-white dark:bg-white dark:text-black px-4 py-3 rounded-2xl shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 flex items-center justify-center">
              <Check size={14} strokeWidth={3} />
            </div>
            <span>{copyToast}</span>
            <button onClick={() => setCopyToast(null)} className="ml-2 text-gray-400 hover:text-white dark:hover:text-black cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}