import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Captação Cinematográfica",
    description: "Equipe completa com câmeras cinema, drone e estabilizador. Cada move executado para criar sensação real de presença e escala."
  },
  {
    number: "02",
    title: "Edição & Color Grade",
    description: "Pós-produção com look cinematográfico e trilha licenciada. Cada frame calibrado para transmitir luxo e sofisticação."
  },
  {
    number: "03",
    title: "Entrega & Distribuição",
    description: "Arquivo master 4K + versões para redes, portais e stories. Entrega em até 5 dias úteis com duas rodadas de revisão inclusas."
  }
];

export default function Process() {
  return (
    <section id="processo" className="bg-[#111111] py-24 px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-8">
            Da captação <br />
            à <span className="text-[#FF6321]">entrega final.</span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Um processo claro, colaborativo e desenhado para eliminar 
            retrabalho e garantir exatamente o resultado que você imaginou.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] p-10 flex flex-col h-full group hover:bg-[#222222] transition-colors duration-500"
            >
              <span className="text-[#FF6321] font-mono text-sm font-bold mb-8 block">
                {step.number}
              </span>
              
              <h3 className="text-white text-2xl font-bold mb-6 leading-snug group-hover:text-[#FF6321] transition-colors duration-300">
                {step.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed text-[15px]">
                {step.description}
              </p>
              
              <div className="mt-auto pt-10">
                <div className="w-12 h-[1px] bg-white/10 group-hover:w-full group-hover:bg-[#FF6321] transition-all duration-700" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
