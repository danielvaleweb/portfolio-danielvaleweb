const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const target = `                {/* Category Filters Bar for Projects */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'Todas', label: lang === 'pt' ? 'Todos os Projetos' : 'All Projects', count: realProjects.length },
                    { id: 'Imobiliário', label: lang === 'pt' ? 'Imobiliário' : 'Real Estate', count: imobiliarioProjects.length },
                    { id: 'Publicidade', label: lang === 'pt' ? 'Publicidade' : 'Advertising', count: publicidadeProjects.length },
                    { id: 'Institucional', label: lang === 'pt' ? 'Institucional' : 'Corporate', count: institucionalProjects.length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setProjectCategoryFilter(filter.id);
                        setCurrentPage(1);
                      }}
                      className={\`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer \${
                        projectCategoryFilter === filter.id || (filter.id === 'Publicidade' && projectCategoryFilter === 'Publicitário')
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                          : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#222]'
                      }\`}
                    >
                      <span>{filter.label}</span>
                      <span className={\`text-[10px] px-1.5 py-0.5 rounded-full \${
                        projectCategoryFilter === filter.id || (filter.id === 'Publicidade' && projectCategoryFilter === 'Publicitário')
                          ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-[#222] text-gray-500 dark:text-gray-400'
                      }\`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>`;

content = content.replace(target, '');
fs.writeFileSync('src/pages/Admin.tsx', content, 'utf8');
