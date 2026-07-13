import Gallery from "../components/Gallery";
import { motion } from "motion/react";

export default function Work() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-20"
    >
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h1 className="text-6xl font-bold text-black tracking-tight mb-4">Portfólio</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Explora a minha coleção de vídeos imobiliários de alta qualidade. Cada projeto é uma história única contada através de lentes cinematográficas.
        </p>
      </div>
      <Gallery />
    </motion.div>
  );
}
