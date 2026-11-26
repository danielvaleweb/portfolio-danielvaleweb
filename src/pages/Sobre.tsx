import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
            <p className="text-lg text-gray-500 leading-relaxed mb-10">
              Com anos de experiência e um olhar atento para a estética cinematográfica, ajudo corretores e proprietários a venderem seus imóveis de forma mais rápida e eficiente através de imagens que encantam.
            </p>

            <div>
              <Link
                to="/planos"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold text-base shadow-[0_12px_28px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-all duration-300 transform hover:-translate-y-0.5 group cursor-pointer"
              >
                <span>Conheça nossos planos</span>
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
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
    </motion.div>
  );
}
