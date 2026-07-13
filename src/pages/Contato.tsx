import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, Instagram, Zap, CheckCircle } from "lucide-react";
import { addLead } from "../utils/storage";

export default function Contato() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !telefone.trim() || !email.trim() || !mensagem.trim()) {
      return;
    }

    // Save lead to local storage
    addLead({
      name: nome.trim(),
      phone: telefone.trim(),
      email: email.trim(),
      message: mensagem.trim()
    });

    // Create the WhatsApp link
    const waNumber = "5532998288650";
    const waText = `Olá Daniel! Gostaria de entrar em contato. Seguem meus dados:\n\n` +
      `*Nome:* ${nome.trim()}\n` +
      `*Telefone:* ${telefone.trim()}\n` +
      `*E-mail:* ${email.trim()}\n` +
      `*Mensagem:* ${mensagem.trim()}`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    // Set success animation
    setSuccess(true);

    // Redirect to WhatsApp
    setTimeout(() => {
      window.open(waUrl, "_blank");
      // Reset form
      setNome("");
      setTelefone("");
      setEmail("");
      setMensagem("");
      setSuccess(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-32"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div>
            <h1 className="text-6xl font-bold text-black tracking-tight mb-8">Vamos conversar?</h1>
            <p className="text-xl text-gray-500 mb-12 max-w-md">
              Estou pronto para transformar seu próximo projeto imobiliário com um olhar cinematográfico.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Telefone</p>
                  <p className="text-lg font-medium text-black">+55 32 99828-8650</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">E-mail</p>
                  <p className="text-lg font-medium text-black">contato@danielvale.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                  <Instagram size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Instagram</p>
                  <p className="text-lg font-medium text-black">@danielvaleweb</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-[40px] p-12 border border-gray-100 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold text-black mb-8">Envie uma mensagem</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nome</label>
                      <input 
                        type="text" 
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-black transition-colors" 
                        placeholder="Seu nome completo" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Telefone</label>
                      <input 
                        type="tel" 
                        required
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-black transition-colors" 
                        placeholder="(32) 99828-8650" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-black transition-colors" 
                        placeholder="seu@email.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mensagem</label>
                      <textarea 
                        required
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-black transition-colors h-32" 
                        placeholder="Como posso ajudar no seu projeto?"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-gray-900 transition-colors shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center h-full"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100 mb-6"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-black mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-500 max-w-xs mb-8">
                    Seus dados foram salvos no painel e estamos te redirecionando para o WhatsApp...
                  </p>
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    Conectando ao WhatsApp...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
