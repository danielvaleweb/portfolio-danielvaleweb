import Process from "../components/Process";
import { motion } from "motion/react";

export default function Sobre() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32"
    >
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <h1 className="text-6xl font-bold text-black tracking-tight mb-8">Daniel Vale</h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Sou videomaker especializado no mercado imobiliário, focado em criar vídeos que elevam a percepção de valor e destacam cada detalhe do imóvel.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              Com anos de experiência e um olhar atento para a estética cinematográfica, ajudo corretores e proprietários a venderem seus imóveis de forma mais rápida e eficiente através de imagens que encantam.
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://res.cloudinary.com/dgarqyegu/image/upload/v1774924727/Gemini_Generated_Image_t2f2tct2f2tct2f2_ww3ttc.png" 
              alt="Daniel Vale" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
      <Process />
    </motion.div>
  );
}
