const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const target = `                {/* Global Sync with Cloud Firestore Button - not shown in clients tab */}
                {activeTab !== 'clients' && (
                  <button 
                    onClick={handleSyncAll} 
                    disabled={isSyncingFirestore} 
                    className="bg-white dark:bg-[#111111] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#222] px-4 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                    title="Testa conexão e envia todos os clientes e projetos para o Cloud Firestore"
                  >
                    <Cloud size={15} className={isSyncingFirestore ? "animate-spin text-blue-500" : "text-blue-500"} />
                    {isSyncingFirestore ? "Sincronizando..." : "Sincronizar Banco"}
                  </button>
                )}`;

if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync('src/pages/Admin.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string!");
}
