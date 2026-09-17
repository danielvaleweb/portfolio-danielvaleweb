const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Fix menuItems state
const oldMenuState = `  const [menuItems, setMenuItems] = useState([
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
  ]);`;

const newMenuState = `  const [menuItems, setMenuItems] = useState([
    { id: 'dashboard', iconName: 'LayoutGrid', labelKey: 'dashboard', disabled: false, section: 'main' },
    { id: 'projects', iconName: 'Folder', labelKey: 'projects', disabled: false, section: 'main' },
    { id: 'notes', iconName: 'FileText', labelKey: 'notes', disabled: true, section: 'main' },
    { id: 'files', iconName: 'Cloud', labelKey: 'files', disabled: true, section: 'main' },
    { id: 'chats', iconName: 'MessageCircle', labelKey: 'chats', disabled: true, section: 'main' },
    { id: 'mail', iconName: 'Mail', labelKey: 'mail', disabled: true, section: 'main' },
    { id: 'users', iconName: 'Users', labelKey: 'users', disabled: true, section: 'main' },
    { id: 'calendar', iconName: 'Calendar', labelKey: 'calendar', disabled: true, section: 'main' },
    { id: 'knowledgeBase', iconName: 'Info', labelKey: 'knowledgeBase', disabled: true, section: 'main' },
    { id: 'clients', iconName: 'Users', labelKey: 'clients', disabled: false, section: 'main' },
    { id: 'messenger', iconName: 'MessageSquare', labelKey: 'messenger', disabled: true, section: 'main' },
    { id: 'settings', iconName: 'Settings', labelKey: 'settings', disabled: true, section: 'more' },
    { id: 'learn', iconName: 'BookOpen', labelKey: 'learn', disabled: true, section: 'more' },
    { id: 'helpCenter', iconName: 'HelpCircle', labelKey: 'helpCenter', disabled: true, section: 'more' },
    { id: 'support', iconName: 'Headphones', labelKey: 'support', disabled: true, section: 'more' },
  ]);`;
content = content.replace(oldMenuState, newMenuState);

// 2. Fix drag and drop references
const oldDragRefs = `  const draggedItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);`;
const newDragRefs = `  const draggedItemIdRef = useRef<string | null>(null);
  const dragOverItemIdRef = useRef<string | null>(null);`;
content = content.replace(oldDragRefs, newDragRefs);

// 3. Fix handleSort
const oldHandleSort = `  const handleSort = () => {
    if (draggedItemRef.current !== null && dragOverItemRef.current !== null) {
      const newItems = [...menuItems];
      const draggedItem = newItems.splice(draggedItemRef.current, 1)[0];
      newItems.splice(dragOverItemRef.current, 0, draggedItem);
      setMenuItems(newItems);
    }
    draggedItemRef.current = null;
    dragOverItemRef.current = null;
  };`;
const newHandleSort = `  const handleSort = () => {
    if (draggedItemIdRef.current && dragOverItemIdRef.current && draggedItemIdRef.current !== dragOverItemIdRef.current) {
      const newItems = [...menuItems];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItemIdRef.current);
      const overIndex = newItems.findIndex(item => item.id === dragOverItemIdRef.current);
      
      if (draggedIndex !== -1 && overIndex !== -1) {
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(overIndex, 0, draggedItem);
        setMenuItems(newItems);
      }
    }
    draggedItemIdRef.current = null;
    dragOverItemIdRef.current = null;
  };`;
content = content.replace(oldHandleSort, newHandleSort);

// 4. Update Sidebar rendering
const oldSidebarNav = `        <div className="px-3 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start">
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
        </div>`;

const newSidebarNav = `        <div className="px-3 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start">
          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 mb-2 text-[11px] font-bold text-gray-500 dark:text-[#555555] uppercase tracking-wider">{t.navigate}</h4>}
            {isSidebarCollapsed && <div className="h-4"></div>}
            <div className="space-y-0.5">
              {menuItems.filter(item => item.section === 'main' && visibleMenuIds.has(item.id)).map((item) => (
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
                  onDragStart={() => (draggedItemIdRef.current = item.id)}
                  onDragOver={(e: any) => { e.preventDefault(); dragOverItemIdRef.current = item.id; }}
                  onDrop={handleSort}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 mb-2 text-[11px] font-bold text-gray-500 dark:text-[#555555] uppercase tracking-wider">{t.more}</h4>}
            {isSidebarCollapsed && <div className="h-4"></div>}
            <div className="space-y-0.5">
              {menuItems.filter(item => item.section === 'more' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem 
                  key={item.id}
                  icon={iconMap[item.iconName]} 
                  label={(t as any)[item.labelKey] || item.labelKey} 
                  active={activeTab === item.id} 
                  disabled={item.disabled}
                  onClick={() => {}} 
                  collapsed={isSidebarCollapsed}
                  draggable={!isSidebarCollapsed}
                  onDragStart={() => (draggedItemIdRef.current = item.id)}
                  onDragOver={(e: any) => { e.preventDefault(); dragOverItemIdRef.current = item.id; }}
                  onDrop={handleSort}
                />
              ))}
            </div>
          </div>
        </div>`;
content = content.replace(oldSidebarNav, newSidebarNav);

// 5. Remove overlay ProjectForm
const oldOverlay = `      {/* Full Screen Overlay for Project Form */}
      {(isCreating || editingProject) && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-[#050505] z-[200] overflow-y-auto no-scrollbar p-4 sm:p-10 flex flex-col">
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
      )}`;
content = content.replace(oldOverlay, "");

// 6. Inject ProjectForm in main area
const oldMainArea = `            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6 flex-shrink-0">`;
const newMainArea = `            {(isCreating || editingProject) ? (
              <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#222] p-6 sm:p-8 flex-1 shadow-sm relative mb-6">
                <ProjectForm 
                  project={editingProject} 
                  onSave={handleSaveProject} 
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingProject(null);
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
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6 flex-shrink-0">`;

content = content.replace(oldMainArea, newMainArea);

// Close the wrapper
const oldFooter = `            {/* Footer */}`;
const newFooter = `            </>
            )}
            
            {/* Footer */}`;
content = content.replace(oldFooter, newFooter);


fs.writeFileSync('src/pages/Admin.tsx', content);
