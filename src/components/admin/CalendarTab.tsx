import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, MapPin, Clock, Video, FileText, Users, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { getCalendarEvents, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '../../utils/storage';

interface CalendarTabProps {
  lang: 'pt' | 'en';
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ lang }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('todos');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00 - 16:00');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('filmagem');
  const [category, setCategory] = useState<'Imobiliário' | 'Publicidade' | 'Institucional' | 'Geral'>('Imobiliário');
  const [projectName, setProjectName] = useState('');

  const reload = () => {
    setEvents(getCalendarEvents());
  };

  useEffect(() => {
    reload();
    window.addEventListener('calendar-updated', reload);
    return () => window.removeEventListener('calendar-updated', reload);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addCalendarEvent({
      title: title.trim(),
      date,
      time,
      location: location.trim() || undefined,
      type,
      category,
      projectName: projectName.trim() || undefined,
      status: 'agendado'
    });

    setTitle('');
    setLocation('');
    setProjectName('');
    setIsAdding(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'pt' ? 'Excluir este compromisso?' : 'Delete event?')) {
      deleteCalendarEvent(id);
      reload();
    }
  };

  const handleToggleStatus = (event: CalendarEvent) => {
    const nextStatus = event.status === 'concluido' ? 'agendado' : 'concluido';
    updateCalendarEvent(event.id, { status: nextStatus });
    reload();
  };

  const filteredEvents = events.filter(e => {
    if (filterType === 'todos') return true;
    return e.type === filterType;
  });

  const getTypeBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'filmagem':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">
            <Video size={11} /> Diária de Filmagem
          </span>
        );
      case 'entrega':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full">
            <FileText size={11} /> Entrega de Corte
          </span>
        );
      case 'reuniao':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-0.5 rounded-full">
            <Users size={11} /> Alinhamento / Reunião
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['todos', 'filmagem', 'entrega', 'reuniao'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t === 'todos' ? 'Todos os Compromissos' : t === 'filmagem' ? 'Filmagens (Drone/Cam)' : t === 'entrega' ? 'Prazos de Entrega' : 'Reuniões'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={15} />
          {lang === 'pt' ? 'Agendar Diária / Prazo' : 'Add Event'}
        </button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {lang === 'pt' ? 'Novo Evento no Cronograma' : 'New Schedule Event'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Gravação Fachada & Interiores - Casa Alphaville"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="filmagem">Diária de Filmagem (Drone/Câmera)</option>
                    <option value="entrega">Prazo de Entrega de Corte</option>
                    <option value="reuniao">Reunião / Alinhamento de Briefing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Imobiliário">Imobiliário</option>
                    <option value="Publicidade">Publicidade</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Horário / Janela
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ex: 06:30 - Golden Hour"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Localização / Endereço
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Alphaville Residencial 1"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Projeto Vinculado
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Casa Alphaville"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className={`bg-white dark:bg-[#111] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-sm ${
              evt.status === 'concluido'
                ? 'opacity-60 border-gray-200 dark:border-[#1e1e1e]'
                : 'border-gray-200 dark:border-[#222]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                {getTypeBadge(evt.type)}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(evt)}
                    title={evt.status === 'concluido' ? 'Marcar como pendente' : 'Marcar como concluído'}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      evt.status === 'concluido'
                        ? 'text-emerald-500 hover:text-emerald-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <CheckCircle2 size={15} className={evt.status === 'concluido' ? 'fill-emerald-500 text-white' : ''} />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className={`font-bold text-sm text-black dark:text-white mb-2 ${evt.status === 'concluido' ? 'line-through' : ''}`}>
                {evt.title}
              </h4>

              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{new Date(evt.date + 'T00:00:00').toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>

                {evt.time && (
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                )}

                {evt.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {evt.projectName || 'Produção Geral'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-[#1e1e1e]">
                {evt.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
