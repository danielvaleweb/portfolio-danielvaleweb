import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ShieldCheck, AlertCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const AUTHORIZED_ADMIN_EMAILS = [
  'danielvaleweb@gmail.com',
  'danielvaleweb@hotmail.com',
];

export const AUTHORIZED_ADMIN_EMAIL = AUTHORIZED_ADMIN_EMAILS[0];

export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
};

interface AdminLoginProps {
  onAuthenticated?: (user: User) => void;
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        const email = user.email?.toLowerCase().trim();
        if (isAuthorizedAdminEmail(email)) {
          setError(null);
          onAuthenticated?.(user);
        } else {
          signOut(auth);
          setError(`Acesso negado: a conta conectada (${email || 'não identificada'}) não possui permissão para acessar o painel.`);
        }
      }
    });

    return () => unsubscribe();
  }, [onAuthenticated]);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email?.toLowerCase().trim();
      
      if (isAuthorizedAdminEmail(email)) {
        setError(null);
        onAuthenticated?.(result.user);
      } else {
        await signOut(auth);
        setError(`Acesso negado: a conta Google (${email || 'não identificada'}) não possui permissão para acessar o painel.`);
      }
    } catch (err: any) {
      console.warn("Erro na autenticação do Google:", err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('A janela de login com o Google foi fechada antes de concluir.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('O navegador bloqueou a janela pop-up do Google. Por favor, habilite pop-ups para fazer login.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado no Firebase Auth. Adicione este domínio nas configurações de autenticação do Firebase.');
      } else {
        setError(err?.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-light">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#070707] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/10 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_40%,_#000000_100%)] pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-inner">
            <Lock size={26} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Daniel Vale<span className="text-red-600">.</span>
          </h2>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 mt-1">
            Painel Administrativo
          </span>

          <p className="text-xs text-neutral-400 font-light mt-3 max-w-xs leading-relaxed">
            Área de gerenciamento restrita. Autentique-se com sua conta Google autorizada para continuar.
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-left"
          >
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-200 leading-relaxed font-light">
              {error}
            </p>
          </motion.div>
        )}

        {/* Google Login Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full h-13 px-6 rounded-2xl bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-transparent"
          >
            {isSigningIn ? (
              <>
                <Loader2 size={18} className="animate-spin text-neutral-700" />
                <span>Conectando com o Google...</span>
              </>
            ) : (
              <>
                {/* Official Google SVG Icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-neutral-500 font-mono">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Acesso restrito ao administrador</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center">
          <Link
            to="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o site
          </Link>
        </div>
      </motion.div>

      {/* Footer Info */}
      <p className="mt-8 text-neutral-600 text-xs font-mono">
        © {new Date().getFullYear()} Daniel Vale. Acesso Seguro.
      </p>
    </div>
  );
}
