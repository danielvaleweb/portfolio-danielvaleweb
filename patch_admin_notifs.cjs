const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. We need to load and render actual notifications in Admin.tsx
const importSearch = `import { getProjects, addProject, updateProject, getClients, addClient } from '../utils/storage';`;
const importReplace = `import { getProjects, addProject, updateProject, getClients, addClient, getNotifications, markNotificationsAsRead } from '../utils/storage';\nimport { Notification } from '../types';`;
content = content.replace(importSearch, importReplace);

// 2. Add notifications state inside Admin component
const stateSearch = `  const [activeTab, setActiveTab] = useState('dashboard');`;
const stateReplace = `  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const loadNotifs = () => setNotifications(getNotifications());
    loadNotifs();
    window.addEventListener('notificationsUpdated', loadNotifs);
    return () => window.removeEventListener('notificationsUpdated', loadNotifs);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
`;
content = content.replace(stateSearch, stateReplace);

// 3. Update the Bell icon badge to use unreadCount
const bellBadgeSearch = `<span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-srgb-wave border-2 border-white dark:border-[#0a0a0a]"></span>`;
const bellBadgeReplace = `{unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#0a0a0a]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}`;
content = content.replace(bellBadgeSearch, bellBadgeReplace);

// Make clicking the bell mark them as read
const bellClickSearch = `onClick={() => setShowNotifications(!showNotifications)}`;
const bellClickReplace = `onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markNotificationsAsRead();
                    setNotifications(getNotifications()); // update locally immediately
                  }
                }}`;
content = content.replace(bellClickSearch, bellClickReplace);

// 4. Update the notification dropdown list
const dropdownSearch = `<h4 className="text-[13px] font-bold text-black dark:text-white mb-3">Notificações</h4>
                    <div className="space-y-3">
                      <div className="text-[12px] text-gray-600 dark:text-[#aaa]">
                        <span className="font-bold text-black dark:text-white">Novo comentário</span> no projeto Residencial Alphaville.
                      </div>
                      <div className="text-[12px] text-gray-600 dark:text-[#aaa]">
                        <span className="font-bold text-black dark:text-white">Relatório</span> da semana já disponível.
                      </div>
                    </div>`;

const dropdownReplace = `<h4 className="text-[13px] font-bold text-black dark:text-white mb-3">Notificações</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-[12px] text-gray-500 text-center py-4">Nenhuma notificação</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={\`text-[12px] p-2 rounded-lg \${!notif.read ? 'bg-gray-50 dark:bg-[#222]' : ''}\`}>
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
                    </div>`;
content = content.replace(dropdownSearch, dropdownReplace);

fs.writeFileSync('src/pages/Admin.tsx', content);

