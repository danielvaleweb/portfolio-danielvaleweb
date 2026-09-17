const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Inject state
const stateInjection = `
  const [realClients, setRealClients] = useState<Client[]>([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  
  const [actionModal, setActionModal] = useState<'review' | 'download' | null>(null);
  const [actionProject, setActionProject] = useState<Project | null>(null);

  useEffect(() => {
    setRealClients(getClients());
    const handleClientsUpdate = () => setRealClients(getClients());
    window.addEventListener("clients-updated", handleClientsUpdate);
    return () => window.removeEventListener("clients-updated", handleClientsUpdate);
  }, []);

  const handleActionClick = (action: 'review' | 'download', project: Project) => {
    setActionProject(project);
    setActionModal(action);
  };
`;
content = content.replace(
  "const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());",
  "const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());\n" + stateInjection
);

// 2. Inject Client creation handler
const clientHandler = `
  const handleSaveClient = () => {
    if (newClientName.trim()) {
      addClient({ name: newClientName, logoUrl: '' });
      setNewClientName('');
      setIsCreatingClient(false);
    }
  };
`;
content = content.replace(
  "const pieData = [",
  clientHandler + "\n  const pieData = ["
);

// 3. Replace Clients UI
const oldClientsUI = `<div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm h-full min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                  <Briefcase size={32} className="text-gray-400 dark:text-[#555]" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t.manageClients}</h3>
                <p className="text-gray-500 dark:text-[#777] text-[13px] mb-8 text-center max-w-sm">Esta seção ainda está em construção. Aqui você poderá gerenciar seus clientes, atribuir projetos e acompanhar contratos.</p>
              </div>`;

const newClientsUI = `<div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                  <h3 className="text-xl font-bold text-black dark:text-white">{t.manageClients}</h3>
                  <button 
                    onClick={() => setIsCreatingClient(true)}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={16} /> Add Clients
                  </button>
                </div>
                
                {realClients.length === 0 ? (
                  <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm h-full min-h-[400px]">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                      <Briefcase size={32} className="text-gray-400 dark:text-[#555]" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">Nenhum cliente</h3>
                    <p className="text-gray-500 dark:text-[#777] text-[13px] mb-8 text-center max-w-sm">Nenhum cliente cadastrado. Clique no botão acima para adicionar seu primeiro cliente.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 content-start pb-6">
                    {realClients.map(client => (
                      <div key={client.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 flex flex-col items-center relative shadow-sm">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-4 border border-gray-200 dark:border-[#333]">
                           {client.logoUrl ? <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" /> : <User size={24} className="text-gray-400" />}
                        </div>
                        <h4 className="font-bold text-[15px] text-gray-900 dark:text-white">{client.name}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>`;
content = content.replace(oldClientsUI, newClientsUI);

// 4. Update paginatedProjects mapping to include onActionClick
content = content.replace(
  'onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}\n                      onClick={() => setEditingProject(project)}',
  'onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}\n                      onClick={() => setEditingProject(project)}\n                      onActionClick={handleActionClick}'
);

// 5. Add modals at the end just before final </div></div></div></div>
const modals = `
      {/* Create Client Modal */}
      {isCreatingClient && (
        <div className="absolute inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Adicionar Novo Cliente</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider mb-2 block">Nome do Cliente</label>
                <input 
                  type="text" 
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
                  placeholder="Ex: Linea Studio"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsCreatingClient(false)}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-[#222] text-gray-600 dark:text-[#ccc] text-[13px] font-bold hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClient}
                className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-full text-[13px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Salvar Cliente
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
                  href={\`https://wa.me/?text=\${encodeURIComponent('Olá! Segue o link para avaliação do projeto "' + actionProject.title + '": ' + window.location.origin + '/avaliar/' + actionProject.id)}\`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Enviar no WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl p-6 flex flex-col items-center justify-center mb-6">
                   <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-2">Código Gerado</p>
                   <p className="text-3xl text-gray-900 dark:text-white font-mono font-black tracking-[0.2em]">
                     {actionProject.downloadCode || 'N/A'}
                   </p>
                   {!actionProject.downloadCode && (
                     <p className="text-[11px] text-red-500 mt-2">Habilite o download nas edições do projeto.</p>
                   )}
                </div>
                
                {actionProject.downloadCode && (
                  <div className="flex flex-col gap-3">
                    <a 
                      href={\`mailto:?subject=\${encodeURIComponent('Acesso ao seu projeto: ' + actionProject.title)}&body=\${encodeURIComponent('Olá, seu código de download é: ' + actionProject.downloadCode)}\`}
                      className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail size={18} /> Enviar via E-mail
                    </a>
                    <a 
                      href={\`https://wa.me/?text=\${encodeURIComponent('Olá! O código de download do seu projeto "' + actionProject.title + '" é: *' + actionProject.downloadCode + '*')}\`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2"
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
`;

content = content.replace('    </div>\n  );\n}', modals + '\n    </div>\n  );\n}');

fs.writeFileSync('src/pages/Admin.tsx', content);
