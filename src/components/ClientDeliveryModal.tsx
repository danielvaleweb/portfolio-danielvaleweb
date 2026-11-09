import React, { useState, useEffect } from "react";
import { Project, Client } from "../types";
import { updateProject, getClients } from "../utils/storage";
import { getPublicOrigin } from "../utils/urlHelper";
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles, 
  RefreshCw, 
  MessageCircle, 
  ShieldCheck, 
  Link as LinkIcon, 
  Star, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Phone,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClientDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject?: (updated: Project) => void;
}

export default function ClientDeliveryModal({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}: ClientDeliveryModalProps) {
  // Ensure unique downloadCode exists for this project
  const [downloadCode, setDownloadCode] = useState<string>(() => {
    if (project.downloadCode && project.downloadCode.trim() !== "") {
      return project.downloadCode.trim().toUpperCase();
    }
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    updateProject(project.id, { downloadCode: newCode, allowDownload: true });
    return newCode;
  });

  const [downloadUrlInput, setDownloadUrlInput] = useState(project.downloadUrl || "");
  const [isSavingDownloadUrl, setIsSavingDownloadUrl] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Clients lookup
  const clients = getClients();
  const linkedClient = clients.find((c) => c.id === project.clientId);
  const clientName = linkedClient?.name || "";
  const clientPhone = linkedClient?.phone || "";

  // Base and specific URLs (usa sempre o domínio oficial público para que WhatsApp e clientes acessem de qualquer lugar)
  const origin = getPublicOrigin();
  const projectDeliveryUrl = `${origin}/projeto/${project.id}?unlock=${downloadCode}`;
  const evaluationUrl = `${origin}/avaliar/${project.id}`;

  // Formatted default message (sem emojis, com código de liberação)
  const generateMessage = (code: string) => {
    const projUrl = `${origin}/projeto/${project.id}?unlock=${code}`;
    const evalUrl = `${origin}/avaliar/${project.id}`;
    return `Olá${clientName ? ` ${clientName}` : ""}! Seu vídeo está pronto!

Preparamos o projeto *"${project.title}"* com todo o cuidado e a mais alta qualidade cinematográfica.

Assista e baixe em alta resolução pelo link exclusivo:
${projUrl}
(Seu acesso para download direto já está liberado pelo link acima)

Código de liberação para download: *${code}*

Sua opinião é muito importante para nós! Avalie em menos de 1 minuto:
${evalUrl}

Ficamos muito felizes em realizar essa produção com você! Qualquer dúvida, estamos à disposição.`;
  };

  const [messageText, setMessageText] = useState(() => generateMessage(downloadCode));

  useEffect(() => {
    setMessageText(generateMessage(downloadCode));
  }, [downloadCode, project.id, project.title, clientName]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = async (text: string, fieldId: string, feedbackMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      showToast(feedbackMsg);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      showToast("Não foi possível copiar automaticamente.");
    }
  };

  const handleRegenerateCode = () => {
    if (!window.confirm("Deseja gerar um novo código de desbloqueio? O link anterior do cliente deixará de funcionar.")) return;
    setIsRegenerating(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDownloadCode(newCode);
    updateProject(project.id, { downloadCode: newCode, allowDownload: true });
    onUpdateProject?.({ ...project, downloadCode: newCode, allowDownload: true });
    setIsRegenerating(false);
    showToast("Novo código gerado com sucesso! Links atualizados.");
  };

  const handleSaveDownloadUrl = () => {
    setIsSavingDownloadUrl(true);
    updateProject(project.id, { downloadUrl: downloadUrlInput.trim() });
    onUpdateProject?.({ ...project, downloadUrl: downloadUrlInput.trim() });
    setIsSavingDownloadUrl(false);
    showToast("Link de download salvo no projeto!");
  };

  const handleDownloadThumbnail = () => {
    if (!project.thumbnail) return;
    const a = document.createElement("a");
    a.href = project.thumbnail;
    a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, "_")}_capa.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Baixando imagem da capa para anexar...");
  };

  // Converte a imagem da capa em Blob de forma 100% resiliente (suportando CORS, base64 e proxy)
  const getThumbnailBlob = async (): Promise<Blob | null> => {
    if (!project.thumbnail) return null;
    const url = project.thumbnail;

    // Se já for data URL
    if (url.startsWith('data:image')) {
      try {
        const res = await fetch(url);
        return await res.blob();
      } catch {}
    }

    // 1. Fetch direto com CORS
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) return blob;
      }
    } catch {}

    // 2. Offscreen Canvas
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 1200;
            canvas.height = img.naturalHeight || 675;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(resolve, 'image/png');
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
      if (blob && blob.size > 0) return blob;
    } catch {}

    // 3. Fallback com proxy para imagens sem CORS
    try {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=png`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) return blob;
      }
    } catch {}

    return null;
  };

  const handleCopyThumbnail = async () => {
    if (!project.thumbnail) return;
    try {
      const blob = await getThumbnailBlob();
      if (blob && navigator.clipboard && "write" in navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
            "text/plain": new Blob([messageText], { type: "text/plain" })
          })
        ]);
        setCopiedField("thumb");
        showToast("Foto e mensagem copiadas! No WhatsApp basta pressionar Ctrl+V.");
        setTimeout(() => setCopiedField(null), 3000);
        return;
      }
    } catch {
      handleDownloadThumbnail();
    }
  };

  const handleSendWhatsApp = async () => {
    // Garante que o texto completo da mensagem esteja copiado para a área de transferência
    try {
      await navigator.clipboard.writeText(messageText);
      showToast("Mensagem copiada! Abrindo WhatsApp...");
    } catch {}

    // Abre a conversa do WhatsApp com a mensagem pronta
    const text = encodeURIComponent(messageText);
    let cleanPhone = clientPhone.replace(/\D/g, "");
    if (cleanPhone) {
      if (cleanPhone.length <= 11 && !cleanPhone.startsWith("55")) {
        cleanPhone = "55" + cleanPhone;
      }
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-neutral-900 dark:text-neutral-100"
      >
        {/* Toast Feedback */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-white/20 dark:border-black/10"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50/50 dark:bg-[#161616]/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Send size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Entrega de Vídeo ao Cliente</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                  Desbloqueio VIP
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#888]">
                Link com autorização direta de download + link de avaliação + miniatura da produção.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#222] text-gray-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Card Preview do Projeto e Capa (Thumbnail) */}
          <div className="bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#292929] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Thumbnail com botões de anexar/copiar */}
            <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-gray-300 dark:border-[#333] flex-shrink-0 group">
              <img
                src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=600"}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyThumbnail}
                  className="p-1.5 rounded-lg bg-white/90 text-neutral-900 hover:bg-white text-xs font-bold shadow transition-transform active:scale-95 cursor-pointer"
                  title="Copiar imagem para colar no WhatsApp Web"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadThumbnail}
                  className="p-1.5 rounded-lg bg-white/90 text-neutral-900 hover:bg-white text-xs font-bold shadow transition-transform active:scale-95 cursor-pointer"
                  title="Baixar imagem da thumb para anexar"
                >
                  <Download size={13} />
                </button>
              </div>
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white flex items-center gap-1">
                <ImageIcon size={10} /> Capa
              </div>
            </div>

            {/* Infos do Projeto & Ações de Capa */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  {project.category || "Produção"}
                </span>
                {linkedClient && (
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-[#888] flex items-center gap-1 truncate">
                    Cliente: <strong className="text-gray-800 dark:text-[#ccc]">{linkedClient.name}</strong>
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mb-2">{project.title}</h3>

              {/* Botões rápidos da Capa */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyThumbnail}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedField === "thumb"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700"
                      : "bg-white dark:bg-[#222] text-gray-700 dark:text-[#bbb] border-gray-300 dark:border-[#333] hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                  }`}
                  title="Copie e aperte Ctrl+V no WhatsApp para anexar a foto da capa"
                >
                  {copiedField === "thumb" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedField === "thumb" ? "Copiada!" : "Copiar Imagem da Capa"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadThumbnail}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#222] text-gray-700 dark:text-[#bbb] hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Baixe a foto no seu computador/celular para anexar na conversa"
                >
                  <Download size={12} />
                  <span>Baixar Imagem</span>
                </button>
              </div>
            </div>
          </div>

          {/* Código de Desbloqueio Único deste Cliente */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Código de Desbloqueio Único
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                      Protegido por Projeto
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-[#888] mt-0.5">
                    Cada projeto possui um código exclusivo. Nenhum outro cliente consegue desbloquear este projeto.
                  </p>
                </div>
              </div>

              {/* Tag com o código, botão de copiar e botão de regenerar */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <span className="font-mono font-black text-sm tracking-[0.2em] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs select-all">
                  {downloadCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(downloadCode, "code", "Código de liberação copiado com sucesso!")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedField === "code"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300"
                      : "bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-[#ccc] border-gray-300 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222]"
                  }`}
                  title="Copiar apenas o código de liberação"
                >
                  {copiedField === "code" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedField === "code" ? "Copiado!" : "Copiar Código"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="p-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  title="Gerar novo código de desbloqueio (invalida o link anterior)"
                >
                  <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Links Individuais */}
          <div className="space-y-3">
            {/* 1. Link do Projeto com Desbloqueio Direto */}
            <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <LinkIcon size={13} className="text-emerald-600 dark:text-emerald-400" />
                  Link do Projeto (Com Download Liberado)
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Desbloqueio Automático
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl px-3 py-2">
                <span className="font-mono text-xs text-gray-600 dark:text-[#aaa] truncate flex-1 select-all">
                  {projectDeliveryUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(projectDeliveryUrl, "projLink", "Link de acesso do projeto copiado!")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    copiedField === "projLink"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#282828]"
                  }`}
                  title="Copiar Link"
                >
                  {copiedField === "projLink" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
                <a
                  href={projectDeliveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#282828] transition-colors"
                  title="Testar Link (Abrir em nova aba)"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* 2. Link de Avaliação */}
            <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  Link de Avaliação do Projeto
                </span>
                <span className="text-[10px] text-gray-500 dark:text-[#777]">Depoimento do Cliente</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl px-3 py-2">
                <span className="font-mono text-xs text-gray-600 dark:text-[#aaa] truncate flex-1 select-all">
                  {evaluationUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(evaluationUrl, "evalLink", "Link de avaliação copiado!")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    copiedField === "evalLink"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#282828]"
                  }`}
                  title="Copiar Link"
                >
                  {copiedField === "evalLink" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
                <a
                  href={evaluationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#282828] transition-colors"
                  title="Abrir página de avaliação"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Mensagem Formatada para WhatsApp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-[#aaa] uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-600" />
                Mensagem Pronta para WhatsApp
              </label>
              <button
                type="button"
                onClick={() => handleCopy(messageText, "message", "Mensagem completa copiada com sucesso!")}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedField === "message" ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === "message" ? "Mensagem Copiada!" : "Copiar Texto Completo"}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={7}
                className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-3.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none shadow-inner"
                placeholder="Mensagem para o cliente..."
              />
            </div>
          </div>

          {/* Download URL Quick Configuration if missing or present */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-[#aaa]">
                <Download size={13} />
                <span>Link do Arquivo em Alta Resolução (Drive / Dropbox)</span>
              </div>
              {project.downloadUrl ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Configurado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle size={11} /> Não configurado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={downloadUrlInput}
                onChange={(e) => setDownloadUrlInput(e.target.value)}
                placeholder="Cole o link do Google Drive ou Dropbox com os arquivos originais..."
                className="flex-1 bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveDownloadUrl}
                disabled={isSavingDownloadUrl}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salvar link de download no projeto"
              >
                <Save size={13} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer / Primary Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#222] bg-gray-50/50 dark:bg-[#161616]/50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] text-gray-500 dark:text-[#777] text-center sm:text-left">
            {clientPhone ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Phone size={12} /> WhatsApp do cliente: {clientPhone}
              </span>
            ) : (
              <span>Dica: Copie a imagem da capa antes de abrir o WhatsApp.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleCopy(messageText, "message_btn", "Mensagem copiada para a área de transferência!")}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-full border border-gray-300 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-xs font-bold text-gray-700 dark:text-[#ddd] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedField === "message_btn" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copiedField === "message_btn" ? "Copiado!" : "Copiar Mensagem"}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

