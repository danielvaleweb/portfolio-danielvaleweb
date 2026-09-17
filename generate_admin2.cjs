const fs = require('fs');

const code = `
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, HelpCircle, Settings, Star, X, Briefcase, Plus, MoreHorizontal, ChevronLeft, ChevronRight, ArrowUp, MessageSquare,
  LayoutGrid, Folder, FileText, Cloud, MessageCircle, Mail, Users, Calendar, Info, Globe, Moon, Sun, BookOpen, Headphones, ChevronDown, Check, ChevronUp, LogOut
} from 'lucide-react';
import { Project } from '../types';
import { getProjects, addProject, updateProject } from '../utils/storage';
import ProjectForm from '../components/ProjectForm';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    logout: 'Sair'
  }
};

const iconMap: Record<string, any> = {
  LayoutGrid, Folder, FileText, Cloud, MessageCircle, Mail, Users, Calendar, Info, Briefcase, MessageSquare, Settings, Globe, Moon, Sun, BookOpen, HelpCircle, Headphones
};

const NavItem = ({ icon: Icon, label, active = false, disabled = false, onClick, collapsed = false, draggable, onDragStart, onDragOver, onDrop }: { icon: any, label: string, active?: boolean, disabled?: boolean, onClick?: () => void, collapsed?: boolean, draggable?: boolean, onDragStart?: any, onDragOver?: any, onDrop?: any }) => (
  <button 
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={\`flex items-center gap-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left \${active ? 'bg-[#222222] dark:bg-[#222222] text-black dark:text-white bg-gray-200' : 'text-gray-500 dark:text-[#888888] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/50'} \${disabled ? 'opacity-30 cursor-not-allowed' : ''} \${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'w-full px-3'}\`}
    title={collapsed ? label : undefined}
  >
    <Icon size={16} strokeWidth={2.5} className={collapsed ? "flex-shrink-0" : ""} />
    {!collapsed && <span>{label}</span>}
  </button>
);

const Card = ({ 
  project, 
  viewMode = 'grid',
  isSelected = false,
  onToggleSelect,
  onToggleFavorite,
  onClick
}: { 
  project: Project, 
  viewMode?: 'grid' | 'list',
  isSelected?: boolean,
  onToggleSelect?: (e: React.MouseEvent) => void,
  onToggleFavorite?: (e: React.MouseEvent) => void,
  onClick?: () => void
}) => {
  const isFavorite = project.isFavorite;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.controls')) return;
    onClick?.();
  };

  const logo = (
    <img 
      src={project.thumbnail} 
      alt={project.title} 
      className="w-full h-full object-cover" 
      referrerPolicy="no-referrer" 
    />
  );

  if (viewMode === 'list') {
    return (
      <div onClick={handleCardClick} className={\`bg-white dark:bg-[#111111] border \${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#1f1f1f]'} rounded-2xl p-4 flex items-center relative hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors cursor-pointer group shadow-sm\`}>
         <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-inner bg-gray-100 dark:bg-[#1a1a1a] mr-4">
            {logo}
         </div>
         <div className="flex-1">
           <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">{project.title}</h3>
           <p className="text-[13px] text-gray-500 dark:text-[#777] font-medium">{project.category}</p>
         </div>
         <div className="flex items-center gap-4 controls">
           <button 
             onClick={onToggleSelect}
             className={\`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-colors \${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-gray-300 dark:border-[#333] group-hover:border-gray-400 dark:group-hover:border-[#555]'}\`}
           >
             {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
           </button>
           <button 
             onClick={onToggleFavorite}
             className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#222] flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a]"
           >
             <Star size={14} className={\`\${isFavorite ? 'fill-[#EAB308] text-[#EAB308]' : 'text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777]'} transition-colors\`} />
           </button>
           <button className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777] transition-colors">
             <MoreHorizontal size={20} />
           </button>
         </div>
      </div>
    );
  }
  
  return (
    <div onClick={handleCardClick} className={\`bg-white dark:bg-[#111111] border \${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#1f1f1f]'} rounded-3xl p-6 flex flex-col items-center relative hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors cursor-pointer group shadow-sm\`}>
      <div className="absolute top-5 left-5 flex items-center gap-3 controls">
        <button 
          onClick={onToggleSelect}
          className={\`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-colors \${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-gray-300 dark:border-[#333] group-hover:border-gray-400 dark:group-hover:border-[#555]'}\`}
        >
          {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
        </button>
        <button onClick={onToggleFavorite}>
          <Star size={16} className={\`\${isFavorite ? 'fill-[#EAB308] text-[#EAB308]' : 'text-gray-400 dark:text-[#555] group-hover:text-gray-600 dark:group-hover:text-[#777]'} transition-colors\`} />
        </button>
      </div>
      
      <div className="absolute top-5 right-5 text-gray-400 dark:text-[#555] group-hover:text-gray-600 dark:group-hover:text-[#777] transition-colors controls">
        <button>
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="w-20 h-20 mt-8 mb-6 flex items-center justify-center rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-[#1a1a1a]">
        {logo}
      </div>
      
      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1.5 text-center leading-tight">{project.title}</h3>
      <p className="text-[13px] text-gray-500 dark:text-[#777] text-center font-medium">{project.category}</p>
    </div>
  );
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'clients'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [realProjects, setRealProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  
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
  const itemsPerPage = viewMode === 'grid' ? 8 : 6;

  // Sidebar reorder state
  const [menuItems, setMenuItems] = useState([
    { id: 'dashboard', iconName: 'LayoutGrid', labelKey: 'dashboard', disabled: false },
    { id: 'projects', iconName: 'Folder', labelKey: 'projects', disabled: false },
    { id: 'notes', iconName: 'FileText', labelKey: 'notes', disabled: true },
    { id: 'files', iconName: 'Cloud', labelKey: 'files', disabled: true },
    { id: 'chats', iconName: 'MessageCircle', labelKey: 'chats', disabled: true },
    { id: 'mail', iconName: 'Mail', labelKey: 'mail', disabled: true },
    { id: 'users', iconName: 'Users', labelKey: 'users', disabled: true },
    { id: 'calendar', iconName: 'Calendar', labelKey: 'calendar', disabled: true },
    { id: 'knowledgeBase', iconName: 'Info', labelKey: 'knowledgeBase', disabled: true },
    { id: 'clients', iconName: 'Briefcase', labelKey: 'clients', disabled: false },
    { id: 'messenger', iconName: 'MessageSquare', labelKey: 'messenger', disabled: true },
  ]);
  const [visibleMenuIds, setVisibleMenuIds] = useState<Set<string>>(new Set(menuItems.map(m => m.id)));
  
  const draggedItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

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
      updateProject(id, { isFavorite: !project.isFavorite });
    }
  };

  const handleSaveProject = (data: Partial<Project>) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data as Omit<Project, 'id'>);
    }
    setIsCreating(false);
    setEditingProject(null);
  };

  const pieData = [
    { name: 'Imobiliário', value: realProjects.filter(p => p.category === 'Imobiliário').length, color: '#3B82F6' },
    { name: 'Institucional', value: realProjects.filter(p => p.category === 'Institucional').length, color: '#10B981' },
    { name: 'Publicitário', value: realProjects.filter(p => p.category === 'Publicitário').length, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  useEffect(() => {
    setRealProjects(getProjects());
    
    const handleUpdate = () => {
      setRealProjects(getProjects());
    };
    window.addEventListener("projects-updated", handleUpdate);
    return () => {
      window.removeEventListener("projects-updated", handleUpdate);
    };
  }, []);

  const handleSort = () => {
    if (draggedItemRef.current !== null && dragOverItemRef.current !== null) {
      const newItems = [...menuItems];
      const draggedItem = newItems.splice(draggedItemRef.current, 1)[0];
      newItems.splice(dragOverItemRef.current, 0, draggedItem);
      setMenuItems(newItems);
    }
    draggedItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const toggleMenuVisibility = (id: string) => {
    const newSet = new Set(visibleMenuIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleMenuIds(newSet);
  };

  // Pagination logic
  const totalPages = Math.ceil(realProjects.length / itemsPerPage);
  const paginatedProjects = realProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={\`flex h-screen bg-gray-100 dark:bg-[#050505] text-gray-900 dark:text-[#E5E5E5] font-sans overflow-hidden w-full relative z-[100] fixed inset-0\`}>
      
      {/* Sidebar */}
      <aside className={\`\${isSidebarCollapsed ? 'w-[70px]' : 'w-[260px]'} flex-shrink-0 border-r border-gray-200 dark:border-[#1a1a1a] flex flex-col h-full bg-white dark:bg-[#0a0a0a] z-50 pb-6 hidden md:flex transition-all duration-300 relative\`}>
        <div className={\`h-[64px] flex-shrink-0 flex items-center \${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'} mb-4\`}>
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
            <div className="space-y-0.5">
              {menuItems.filter(item => visibleMenuIds.has(item.id)).map((item, index) => (
                <NavItem 
                  key={item.id}
                  icon={iconMap[item.iconName]} 
                  label={(t as any)[item.labelKey] || item.labelKey} 
                  active={activeTab === item.id} 
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.id === 'projects') { setActiveTab('projects'); setCurrentPage(1); }
                    else if (item.id === 'dashboard') setActiveTab('dashboard');
                    else if (item.id === 'clients') setActiveTab('clients');
                  }} 
                  collapsed={isSidebarCollapsed}
                  draggable={!isSidebarCollapsed}
                  onDragStart={() => (draggedItemRef.current = index)}
                  onDragOver={(e: any) => { e.preventDefault(); dragOverItemRef.current = index; }}
                  onDrop={handleSort}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 mb-2 text-[11px] font-bold text-gray-500 dark:text-[#555555] uppercase tracking-wider">{t.more}</h4>}
            {isSidebarCollapsed && <div className="h-4"></div>}
            <div className="space-y-0.5">
              <NavItem icon={Settings} label={t.settings} disabled collapsed={isSidebarCollapsed} />
              <NavItem icon={BookOpen} label={t.learn} disabled collapsed={isSidebarCollapsed} />
              <NavItem icon={HelpCircle} label={t.helpCenter} disabled collapsed={isSidebarCollapsed} />
              <NavItem icon={Headphones} label={t.support} disabled collapsed={isSidebarCollapsed} />
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-100 dark:bg-[#050505]">
        
        {/* Full Screen Overlay for Project Form */}
        {(isCreating || editingProject) && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-[#050505] z-40 overflow-y-auto no-scrollbar p-4 sm:p-10 flex flex-col">
            <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
               <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#222] p-6 sm:p-8 flex-1 shadow-sm relative">
                 <ProjectForm 
                   project={editingProject} 
                   onSave={handleSaveProject} 
                   onCancel={() => {
                     setIsCreating(false);
                     setEditingProject(null);
                   }}
                   lang={lang}
                 />
               </div>
            </div>
          </div>
        )}

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
                <input type="text" placeholder={t.search} className="w-[150px] lg:w-[220px] bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#222] text-[13px] text-gray-900 dark:text-white rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-gray-300 dark:focus:border-[#444] transition-colors" />
              </div>
  
              <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-gray-500 dark:text-[#888]">
                <a href="#" className="text-gray-900 dark:text-white">{t.dashboard}</a>
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
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 dark:text-[#777] hover:text-gray-900 dark:hover:text-white transition-colors relative">
                  <Bell size={18} strokeWidth={2} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-srgb-wave border-2 border-white dark:border-[#0a0a0a]"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg p-4 z-[60]">
                    <h4 className="text-[13px] font-bold text-black dark:text-white mb-3">Notificações</h4>
                    <div className="space-y-3">
                      <div className="text-[12px] text-gray-600 dark:text-[#aaa]">
                        <span className="font-bold text-black dark:text-white">Novo comentário</span> no projeto Residencial Alphaville.
                      </div>
                      <div className="text-[12px] text-gray-600 dark:text-[#aaa]">
                        <span className="font-bold text-black dark:text-white">Relatório</span> da semana já disponível.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={profileMenuRef}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-[#333] overflow-hidden ml-1 flex-shrink-0 cursor-pointer"
                >
                   <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150" alt="User Avatar" className="w-full h-full object-cover" />
                </div>

                {showProfileMenu && (
                  <div className="absolute right-0 top-10 w-32 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors flex items-center gap-2"
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
            
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
                  {activeTab === 'dashboard' ? t.dashboard : activeTab === 'clients' ? t.manageClients : t.allProjects}
                </h1>
                <p className="text-gray-500 dark:text-[#777] text-[13px] font-medium">
                  {activeTab === 'dashboard' ? t.overviewDesc : activeTab === 'clients' ? t.manageClientsDesc : t.allProjectsDesc}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {activeTab === 'projects' && (
                  <div className="hidden sm:flex items-center bg-white dark:bg-[#111111] rounded-full p-1 border border-gray-200 dark:border-[#222]">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={\`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 \${viewMode === 'grid' ? 'bg-black text-white dark:bg-[#222] dark:text-white' : 'text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white'}\`}
                    >
                      <LayoutGrid size={14} /> {t.gridView}
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={\`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 \${viewMode === 'list' ? 'bg-black text-white dark:bg-[#222] dark:text-white' : 'text-gray-500 dark:text-[#777] hover:text-black dark:hover:text-white'}\`}
                    >
                      <Folder size={14} /> {t.listView}
                    </button>
                  </div>
                )}
                
                {activeTab === 'projects' && (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={16} /> {t.addProject}
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            {activeTab === 'clients' ? (
              <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm h-full min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                  <Briefcase size={32} className="text-gray-400 dark:text-[#555]" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t.manageClients}</h3>
                <p className="text-gray-500 dark:text-[#777] text-[13px] mb-8 text-center max-w-sm">Esta seção ainda está em construção. Aqui você poderá gerenciar seus clientes, atribuir projetos e acompanhar contratos.</p>
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
                              <Cell key={\`cell-\${index}\`} fill={entry.color} />
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
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className={\`flex-1 \${viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-3"} overflow-hidden pb-4\`}>
                  {paginatedProjects.map(project => (
                    <Card 
                      key={project.id} 
                      project={project}
                      viewMode={viewMode}
                      isSelected={selectedProjectIds.has(project.id)}
                      onToggleSelect={(e) => handleToggleSelect(project.id, e)}
                      onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
                      onClick={() => setEditingProject(project)}
                    />
                  ))}
                  {paginatedProjects.length === 0 && (
                    <div className="col-span-full flex items-center justify-center h-full text-gray-500 dark:text-[#777] min-h-[200px]">
                       {t.noProjects}
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
                          className={\`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors \${currentPage === idx + 1 ? 'border border-gray-300 dark:border-[#222] bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm' : 'border border-transparent text-gray-500 dark:text-[#777] hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white'}\`}
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
                    <ChevronUp size={14} className={\`\${showLangMenu ? 'rotate-180' : ''} transition-transform\`} />
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
    </div>
  );
}
`
fs.writeFileSync('src/pages/Admin.tsx', code);
