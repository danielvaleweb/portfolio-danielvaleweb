const fs = require('fs');

let content = fs.readFileSync('src/components/ProjectForm.tsx', 'utf8');

content = content.replace(
  'onSave: (data: Partial<Project>) => void;\n  onCancel: () => void;',
  'onSave: (data: Partial<Project>) => void;\n  onCancel: () => void;\n  onNavigateToClients?: () => void;'
);

content = content.replace(
  'export default function ProjectForm({ project, onSave, onCancel, lang = "pt" }: ProjectFormProps) {',
  'export default function ProjectForm({ project, onSave, onCancel, onNavigateToClients, lang = "pt" }: ProjectFormProps) {'
);

const selectClientBlock = `            <select 
              name="clientId"
              value={formData.clientId || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors appearance-none"
            >
              <option value="">{t[lang].selectClient}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>`;

const newSelectClientBlock = `            <select 
              name="clientId"
              value={formData.clientId || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors appearance-none"
            >
              <option value="">{t[lang].selectClient}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <button 
                type="button" 
                onClick={onNavigateToClients}
                className="text-[12px] font-bold text-[#3B82F6] hover:text-[#2563EB] text-left mt-2 block w-full"
              >
                + Adicionar novo cliente
              </button>
            )}`;

content = content.replace(selectClientBlock, newSelectClientBlock);

fs.writeFileSync('src/components/ProjectForm.tsx', content);
