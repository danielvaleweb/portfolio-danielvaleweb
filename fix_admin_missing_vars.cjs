const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Inject the state
const stateSearch = `const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'clients'>('dashboard');`;
const stateReplace = `const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'clients'>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const loadNotifs = () => setNotifications(getNotifications());
    loadNotifs();
    window.addEventListener('notificationsUpdated', loadNotifs as any);
    return () => window.removeEventListener('notificationsUpdated', loadNotifs as any);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;`;

if (content.includes(stateSearch) && !content.includes('const [notifications')) {
  content = content.replace(stateSearch, stateReplace);
  fs.writeFileSync('src/pages/Admin.tsx', content);
}
