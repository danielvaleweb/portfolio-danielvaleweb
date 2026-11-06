import React, { useState } from 'react';
import { BookOpen, Video, Award, Clock, Play, CheckCircle2, ChevronRight } from 'lucide-react';

interface LearnTabProps {
  lang: 'pt' | 'en';
}

export const LearnTab: React.FC<LearnTabProps> = ({ lang }) => {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  const modules = [
    {
      id: 1,
      title: "Cinematografia Imobiliária de Alto Padrão",
      duration: "45 min",
      level: "Avançado",
      summary: "Direção de fotografia arquitetônica, escolha de lentes (16-35mm vs 24-70mm) e controle de flare.",
      lessons: [
        "Composição de linhas guia e pontos de fuga em mansões",
        "Regra dos terços e nivelamento milimétrico em tripé de cabeça fluida",
        "Como iluminar ambientes com janelas superexpostas sem perder o céu exterior",
        "Gravação em Golden Hour e Blue Hour: transição dia/noite"
      ]
    },
    {
      id: 2,
      title: "Operação de Drone DJI: Voo Suave e Seguro",
      duration: "60 min",
      level: "Intermediário",
      summary: "Movimentos orbitais suaves, subidas reveladoras (Orbit + Tilt) e regulamentação DECEA/SARPAS.",
      lessons: [
        "Calibração de curvas de aceleração de gimbal nos modos Cine e Normal",
        "Técnica de Paralaxe cinematográfica com foco travado no ponto de interesse",
        "Plano de voo pré-produção e homologação no SARPAS",
        "Uso de filtros ND/PL (Polarizador Neutro) para manter Shutter Angle em 180°"
      ]
    },
    {
      id: 3,
      title: "Color Grading Cinematográfico no DaVinci Resolve",
      duration: "90 min",
      level: "Avançado",
      summary: "Do S-Log3 / Apple ProRes 422HQ ao Rec.709 e DCI-P3 com pipeline de cor ACES e Color Management.",
      lessons: [
        "Exposição correta no histograma e falsa-cor (+1.7 a +2.0 EV em S-Log3)",
        "Node tree profissional: Balanço de brancos, contraste, saturação e split tone",
        "Remoção de 'green cast' de vidros e gramados com curvas HSL",
        "Exportação limpa de 4K DCI sem compressão destrutiva para telas grandes"
      ]
    },
    {
      id: 4,
      title: "Sound Design e Foley para Vídeos Publicitários",
      duration: "40 min",
      level: "Essencial",
      summary: "Como criar imersão sonora combinando drones de baixa frequência, whooshes e gravação de ambiente.",
      lessons: [
        "Mixagem de trilha instrumental e curva de volume (sidechain) com voz",
        "Camadas de som ambiente (vento suave, água, passos, portas)",
        "Equalização cirúrgica e limitação para padrão broadcast (-14 LUFS)"
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white">
              {lang === 'pt' ? 'Academia de Cinema & Pós-Produção' : 'Filmmaking Academy'}
            </h2>
            <p className="text-xs text-gray-500">
              Guias técnicos e masterclasses de cinematografia, operação de drone e finalização de projetos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const isSelected = selectedModule === m.id;
          return (
            <div
              key={m.id}
              className={`bg-white dark:bg-[#111] border rounded-2xl p-6 transition-all ${
                isSelected 
                  ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                  : 'border-gray-200 dark:border-[#222] hover:border-gray-300 dark:hover:border-[#333]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                  {m.level}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {m.duration}
                </span>
              </div>

              <h3 className="font-bold text-base text-black dark:text-white mb-2">
                {m.title}
              </h3>

              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                {m.summary}
              </p>

              <div className="border-t border-gray-100 dark:border-[#1c1c1c] pt-4 space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Conteúdo Programático:</p>
                {m.lessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{lesson}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#1c1c1c] flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Módulo Completo</span>
                <button
                  onClick={() => setSelectedModule(isSelected ? null : m.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isSelected ? 'Ocultar Detalhes' : 'Ver Guia Completo'} <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
