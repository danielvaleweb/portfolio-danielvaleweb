import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Project, Client, Evaluation, Lead } from "../types";
import { 
  getProjects, addProject, updateProject, deleteProject, resetProjects,
  getClients, addClient, updateClient, deleteClient, resetClients,
  getEvaluations, addEvaluation, updateEvaluation, deleteEvaluation, resetEvaluations,
  getLeads, deleteLead, resetLeads
} from "../utils/storage";
import { 
  Plus, Trash2, Edit2, RotateCcw, Eye, ArrowLeft, Download, Film, Tag, FileText, Image, Users,
  Star, Music, Link2, Copy, Play, Pause, ExternalLink, Sparkles, User, Upload, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ConfirmModal from "../components/ConfirmModal";

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<"portfolio" | "clients" | "evaluations" | "leads">("portfolio");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isEditingClient, setIsEditingClient] = useState<string | null>(null);
  const [isEditingEval, setIsEditingEval] = useState<string | null>(null);
  
  // Form States (Portfolio)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Imobiliário");
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  // Form States (Clients)
  const [clientName, setClientName] = useState("");
  const [clientLogoUrl, setClientLogoUrl] = useState("");

  // Form States (Evaluations)
  const [evalClientName, setEvalClientName] = useState("");
  const [evalStars, setEvalStars] = useState<number>(5);
  const [evalComment, setEvalComment] = useState("");
  const [evalPhotoUrl, setEvalPhotoUrl] = useState("");
  const [evalAudioUrl, setEvalAudioUrl] = useState("");
  const [evalProjectId, setEvalProjectId] = useState("general");

  // Link Generator States
  const [selectedProjectForLink, setSelectedProjectForLink] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Audio Playback states for admin list
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayersRef = useRef<{ [id: string]: HTMLAudioElement }>({});

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    iconType?: "info" | "danger" | "warning";
    confirmLabel: string;
    cancelLabel?: string;
    severity?: "primary" | "danger" | "secondary";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadProjects();
    loadClients();
    loadEvaluations();
    loadLeads();

    // Clean up audio elements on unmount
    return () => {
      (Object.values(audioPlayersRef.current) as HTMLAudioElement[]).forEach(player => player.pause());
    };
  }, []);

  const loadProjects = () => {
    setProjects(getProjects());
    // Select first project as default for link generator
    const all = getProjects();
    if (all.length > 0 && !selectedProjectForLink) {
      setSelectedProjectForLink(all[0].id);
    }
  };

  const loadClients = () => {
    setClients(getClients());
  };

  const loadEvaluations = () => {
    setEvaluations(getEvaluations());
  };

  const loadLeads = () => {
    setLeads(getLeads());
  };


  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !videoUrl.trim()) {
      showNotification("Título e Link do Vídeo são obrigatórios!", "error");
      return;
    }

    const projectData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim(),
      videoUrl: videoUrl.trim(),
      downloadUrl: downloadUrl.trim() || undefined,
      thumbnail: thumbnail.trim()
    };

    if (isEditing) {
      updateProject(isEditing, projectData);
      showNotification("Trabalho atualizado com sucesso!");
      setIsEditing(null);
    } else {
      addProject(projectData);
      showNotification("Novo trabalho adicionado com sucesso!");
    }

    // Reset Form
    setTitle("");
    setDescription("");
    setCategory("Imobiliário");
    setVideoUrl("");
    setDownloadUrl("");
    setThumbnail("");
    
    loadProjects();
  };

  const handleEdit = (project: Project) => {
    setIsEditing(project.id);
    setTitle(project.title);
    setDescription(project.description || "");
    setCategory(project.category);
    setVideoUrl(project.videoUrl);
    setDownloadUrl(project.downloadUrl || "");
    setThumbnail(project.thumbnail);
    
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Danger Zone",
      message: "Deseja remover este vídeo do portfólio?",
      iconType: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      severity: "danger",
      onConfirm: () => {
        deleteProject(id);
        showNotification("Trabalho removido com sucesso!");
        loadProjects();
        
        if (isEditing === id) {
          setIsEditing(null);
          setTitle("");
          setDescription("");
          setCategory("Imobiliário");
          setVideoUrl("");
          setDownloadUrl("");
          setThumbnail("");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReset = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirmation",
      message: "Isso irá apagar seus posts personalizados e restaurar os vídeos originais do portfólio. Deseja continuar?",
      iconType: "warning",
      confirmLabel: "Confirmar",
      cancelLabel: "Cancel",
      severity: "primary",
      onConfirm: () => {
        resetProjects();
        showNotification("Portfólio restaurado aos padrões originais!");
        loadProjects();
        setIsEditing(null);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteLead = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirmar Remoção",
      message: "Deseja remover este lead de contato?",
      iconType: "danger",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      severity: "danger",
      onConfirm: () => {
        deleteLead(id);
        showNotification("Lead de contato removido com sucesso!");
        loadLeads();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetLeads = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirmar Limpeza",
      message: "Isso irá apagar todos os leads de contato registrados. Essa ação é irreversível. Deseja continuar?",
      iconType: "warning",
      confirmLabel: "Limpar Tudo",
      cancelLabel: "Cancelar",
      severity: "danger",
      onConfirm: () => {
        resetLeads();
        showNotification("Todos os leads foram excluídos!");
        loadLeads();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setTitle("");
    setDescription("");
    setCategory("Imobiliário");
    setVideoUrl("");
    setDownloadUrl("");
    setThumbnail("");
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showNotification("Nome do cliente é obrigatório!", "error");
      return;
    }

    // Default logo generator if logoUrl is empty or placeholder is requested
    let finalLogoUrl = clientLogoUrl.trim();
    if (!finalLogoUrl) {
      const cleanInitials = clientName.trim().substring(0, 8).toUpperCase();
      finalLogoUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="20" fill="%23111" letter-spacing="4">${cleanInitials}</text></svg>`;
    }

    const clientData = {
      name: clientName.trim(),
      logoUrl: finalLogoUrl
    };

    if (isEditingClient) {
      updateClient(isEditingClient, clientData);
      showNotification("Cliente atualizado com sucesso!");
      setIsEditingClient(null);
    } else {
      addClient(clientData);
      showNotification("Novo cliente adicionado com sucesso!");
    }

    setClientName("");
    setClientLogoUrl("");
    loadClients();
  };

  const handleEditClient = (client: Client) => {
    setIsEditingClient(client.id);
    setClientName(client.name);
    // If it's a generated inline SVG, leave the field empty for easier editing
    setClientLogoUrl(client.logoUrl.startsWith('data:image/svg') ? '' : client.logoUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClient = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Danger Zone",
      message: "Deseja remover este cliente do carrossel?",
      iconType: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      severity: "danger",
      onConfirm: () => {
        deleteClient(id);
        showNotification("Cliente removido com sucesso!");
        loadClients();
        if (isEditingClient === id) {
          setIsEditingClient(null);
          setClientName("");
          setClientLogoUrl("");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetClients = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirmation",
      message: "Isso irá apagar seus clientes personalizados e restaurar a lista padrão. Deseja continuar?",
      iconType: "warning",
      confirmLabel: "Confirmar",
      cancelLabel: "Cancel",
      severity: "primary",
      onConfirm: () => {
        resetClients();
        showNotification("Clientes restaurados aos padrões originais!");
        loadClients();
        setIsEditingClient(null);
        setClientName("");
        setClientLogoUrl("");
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCancelClientEdit = () => {
    setIsEditingClient(null);
    setClientName("");
    setClientLogoUrl("");
  };

  const handleEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalClientName.trim() || !evalComment.trim()) {
      showNotification("Nome e Comentário são obrigatórios!", "error");
      return;
    }

    const linkedProj = projects.find(p => p.id === evalProjectId);
    const evalData = {
      clientName: evalClientName.trim(),
      stars: evalStars,
      comment: evalComment.trim(),
      photoUrl: evalPhotoUrl.trim() || undefined,
      audioUrl: evalAudioUrl.trim() || undefined,
      projectId: evalProjectId,
      projectName: linkedProj ? linkedProj.title : "Avaliação Geral"
    };

    if (isEditingEval) {
      updateEvaluation(isEditingEval, evalData);
      showNotification("Avaliação editada com sucesso!");
      setIsEditingEval(null);
    } else {
      addEvaluation(evalData);
      showNotification("Avaliação adicionada com sucesso!");
    }

    setEvalClientName("");
    setEvalStars(5);
    setEvalComment("");
    setEvalPhotoUrl("");
    setEvalAudioUrl("");
    setEvalProjectId(projects[0]?.id || "general");
    loadEvaluations();
  };

  const handleEditEval = (evaluation: Evaluation) => {
    setIsEditingEval(evaluation.id);
    setEvalClientName(evaluation.clientName);
    setEvalStars(evaluation.stars);
    setEvalComment(evaluation.comment);
    setEvalPhotoUrl(evaluation.photoUrl || "");
    setEvalAudioUrl(evaluation.audioUrl || "");
    setEvalProjectId(evaluation.projectId || "general");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEval = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Danger Zone",
      message: "Deseja remover esta avaliação?",
      iconType: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      severity: "danger",
      onConfirm: () => {
        deleteEvaluation(id);
        showNotification("Avaliação removida com sucesso!");
        loadEvaluations();
        if (isEditingEval === id) {
          setIsEditingEval(null);
          setEvalClientName("");
          setEvalStars(5);
          setEvalComment("");
          setEvalPhotoUrl("");
          setEvalAudioUrl("");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetEvaluations = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirmation",
      message: "Isso irá apagar todas as avaliações personalizadas e restaurar as avaliações padrão. Deseja continuar?",
      iconType: "warning",
      confirmLabel: "Confirmar",
      cancelLabel: "Cancel",
      severity: "primary",
      onConfirm: () => {
        resetEvaluations();
        showNotification("Avaliações restauradas aos padrões!");
        loadEvaluations();
        setIsEditingEval(null);
        setEvalClientName("");
        setEvalStars(5);
        setEvalComment("");
        setEvalPhotoUrl("");
        setEvalAudioUrl("");
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCancelEvalEdit = () => {
    setIsEditingEval(null);
    setEvalClientName("");
    setEvalStars(5);
    setEvalComment("");
    setEvalPhotoUrl("");
    setEvalAudioUrl("");
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showNotification("Arquivo muito grande! Máximo 1.5MB para persistência.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvalPhotoUrl(reader.result as string);
        showNotification("Foto carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showNotification("Arquivo muito grande! Máximo 1.5MB para persistência.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
        showNotification("Miniatura carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showNotification("Arquivo muito grande! Máximo 3MB para persistência.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvalAudioUrl(reader.result as string);
        showNotification("Áudio carregado com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAndCopyLink = () => {
    if (!selectedProjectForLink) {
      showNotification("Selecione um projeto para gerar o link!", "error");
      return;
    }
    const origin = window.location.origin;
    const link = `${origin}/avaliar/${selectedProjectForLink}`;
    setGeneratedLink(link);
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      showNotification("Link copiado para a área de transferência!");
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      showNotification("Erro ao copiar. Copie manualmente do campo abaixo.", "error");
    });
  };

  const handlePlayPauseEvalAudio = (id: string, audioUrl: string) => {
    if (playingAudioId === id) {
      audioPlayersRef.current[id]?.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioPlayersRef.current[playingAudioId]) {
        audioPlayersRef.current[playingAudioId].pause();
      }

      if (!audioPlayersRef.current[id]) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudioId(null);
        audioPlayersRef.current[id] = audio;
      }

      audioPlayersRef.current[id].play()
        .then(() => setPlayingAudioId(id))
        .catch(err => {
          console.error("Error playing audio", err);
          showNotification("Não foi possível reproduzir este áudio", "error");
        });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-32 pb-24 px-6 md:px-12 font-sans selection:bg-[#FF6321] selection:text-white">
      {/* Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-neutral-200 pb-8">
          <div>
            <div className="flex items-center gap-3 text-[#FF6321] text-xs font-mono uppercase tracking-[0.2em] mb-3 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#FF6321] animate-pulse" />
              Painel do Produtor
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-none">
              Gerenciar Conteúdo
            </h1>
            <p className="text-neutral-500 mt-2 font-light">
              {activeTab === "portfolio" && "Adicione, edite ou remova os vídeos de trabalhos recentes exibidos na página inicial."}
              {activeTab === "clients" && "Cadastre novos clientes, marcas e parceiros comerciais para exibir no loop de logos na página inicial."}
              {activeTab === "evaluations" && "Gerencie avaliações de clientes, gere links de avaliação personalizados e adicione fotos ou áudios."}
              {activeTab === "leads" && "Visualize e gerencie os leads e contatos recebidos através do formulário de contato do site."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-medium rounded-xl border border-neutral-200/60 transition-all duration-300"
            >
              <ArrowLeft size={16} />
              Voltar ao Site
            </Link>
            
            <button 
              onClick={
                activeTab === "portfolio" ? handleReset : 
                activeTab === "clients" ? handleResetClients : 
                activeTab === "evaluations" ? handleResetEvaluations :
                handleResetLeads
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100/80 text-red-600 text-sm font-medium rounded-xl border border-red-200 transition-all duration-300 cursor-pointer"
              title={
                activeTab === "portfolio" ? "Restaurar portfólio para itens originais" : 
                activeTab === "clients" ? "Restaurar clientes para marcas originais" : 
                activeTab === "evaluations" ? "Restaurar avaliações para padrões" :
                "Excluir todos os leads recebidos"
              }
            >
              <RotateCcw size={16} />
              Resetar Padrão
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-8 mb-12 border-b border-neutral-100 pb-0">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "portfolio"
                ? "text-neutral-900 font-bold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Vídeos do Portfólio
            {activeTab === "portfolio" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6321]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "clients"
                ? "text-neutral-900 font-bold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Clientes Recentes (LogoLoop)
            {activeTab === "clients" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6321]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("evaluations")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "evaluations"
                ? "text-neutral-900 font-bold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Avaliações de Clientes
            {activeTab === "evaluations" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6321]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all relative cursor-pointer ${
              activeTab === "leads"
                ? "text-neutral-900 font-bold"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Leads de Contato
            {activeTab === "leads" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6321]" />
            )}
          </button>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border ${
                notification.type === "success" 
                  ? "bg-white border-green-200 text-green-700 shadow-green-100/50" 
                  : "bg-white border-red-200 text-red-700 shadow-red-100/50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium tracking-wide">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Panels */}
        {activeTab === "portfolio" && (
          /* Portfolio Panel Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Panel */}
            <div className="lg:col-span-5 bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6321]/10 text-[#FF6321]">
                  {isEditing ? <Edit2 size={16} /> : <Plus size={18} />}
                </span>
                {isEditing ? "Editar Trabalho" : "Postar Novo Vídeo"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <FileText size={13} className="text-neutral-400" />
                    Título do Trabalho *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alphaville Casa Linea"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                    required
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Tag size={13} className="text-neutral-400" />
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Imobiliário, Comercial, Eventos"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <FileText size={13} className="text-neutral-400" />
                    Descrição (Opcional)
                  </label>
                  <textarea
                    placeholder="Conte um pouco sobre a produção, equipamentos ou conceito do vídeo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all resize-none"
                  />
                </div>

                {/* Video URL Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Film size={13} className="text-neutral-400" />
                    Link do Vídeo *
                  </label>
                  <input
                    type="url"
                    placeholder="Ex: https://www.youtube.com/shorts/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                    required
                  />
                  <p className="text-[11px] text-neutral-400 leading-normal font-light">Suporta links do YouTube, Shorts, Instagram, Google Drive (com permissão pública) ou arquivos MP4 diretos.</p>
                </div>

                {/* Download URL Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Download size={13} className="text-neutral-400" />
                    Link de Download (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="Ex: Google Drive, Dropbox ou link direto para download"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                  />
                  <p className="text-[11px] text-neutral-400 leading-normal font-light">Se informado, exibe um botão de download dedicado para o cliente no modal de exibição do vídeo.</p>
                </div>

                {/* Thumbnail URL Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Image size={13} className="text-neutral-400" />
                    Link da Miniatura (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="Deixe em branco para auto-gerar ou insira o link de uma imagem"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                  />
                  <div className="flex items-center gap-3 mt-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 cursor-pointer transition-colors">
                      <Upload size={12} className="text-neutral-400" />
                      Enviar do Computador
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />
                    </label>
                    {thumbnail && (
                      <button
                        type="button"
                        onClick={() => setThumbnail("")}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-light">Se for vídeo do YouTube, a capa será extraída automaticamente se deixar em branco.</p>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(255,99,33,0.15)] hover:shadow-[0_10px_25px_rgba(255,99,33,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                    {isEditing ? "Salvar Alterações" : "Publicar Vídeo"}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-sm font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer border border-neutral-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Vídeos Publicados</h2>
                  <p className="text-neutral-500 text-sm mt-1 font-light">Total de {projects.length} trabalhos atualmente listados</p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <Film size={40} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 font-light">Nenhum vídeo publicado. Crie um no formulário ao lado!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center gap-4 bg-neutral-50/40 hover:bg-neutral-50 border border-neutral-100 hover:border-neutral-200/80 rounded-2xl p-4 transition-all duration-300"
                    >
                      {/* Thumbnail Preview */}
                      <div className="w-28 h-16 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden relative border border-neutral-200/60">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=280&h=160";
                          }}
                        />
                        <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] tracking-wide font-mono text-[#FF6321] uppercase font-bold shadow-sm">
                          {project.category}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-neutral-900 tracking-tight truncate">
                          {project.title}
                        </h3>
                        {project.description ? (
                          <p className="text-xs text-neutral-500 line-clamp-2 mt-1 font-light leading-relaxed">
                            {project.description}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-400 mt-1 font-light italic">Sem descrição adicional</p>
                        )}
                        
                        {/* URL Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md border border-neutral-200/50">
                            <Film size={10} className="text-[#FF6321]" />
                            Vídeo
                          </span>
                          {project.downloadUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#FF6321]/10 text-[#FF6321] px-2.5 py-1 rounded-md border border-[#FF6321]/20 font-medium">
                              <Download size={10} />
                              Download Ativo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#FF6321] text-neutral-600 hover:text-white border border-neutral-200/60 hover:border-transparent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Editar trabalho"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Remover trabalho"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "clients" && (
          /* Clients Panel Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Panel */}
            <div className="lg:col-span-5 bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6321]/10 text-[#FF6321]">
                  {isEditingClient ? <Edit2 size={16} /> : <Plus size={18} />}
                </span>
                {isEditingClient ? "Editar Cliente" : "Adicionar Cliente"}
              </h2>

              <form onSubmit={handleClientSubmit} className="space-y-6">
                {/* Client Name Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Users size={13} className="text-neutral-400" />
                    Nome da Marca / Cliente *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Coca-Cola, Construtora Linea"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                    required
                  />
                </div>

                {/* Client Logo URL Field */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                    <Image size={13} className="text-neutral-400" />
                    Link do Logo (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="Deixe em branco para gerar logo tipográfico automático"
                    value={clientLogoUrl}
                    onChange={(e) => setClientLogoUrl(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                  />
                  <p className="text-[11px] text-neutral-400 leading-normal font-light">
                    Suporta links diretos de imagens PNG/SVG (de preferência monochrome/transparente). Se deixado em branco, geramos um elegante logo tipográfico vetorizado de alta definição instantaneamente!
                  </p>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(255,99,33,0.15)] hover:shadow-[0_10px_25px_rgba(255,99,33,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isEditingClient ? <Edit2 size={16} /> : <Plus size={16} />}
                    {isEditingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                  </button>

                  {isEditingClient && (
                    <button
                      type="button"
                      onClick={handleCancelClientEdit}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-sm font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer border border-neutral-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Clientes Atuais</h2>
                  <p className="text-neutral-500 text-sm mt-1 font-light">Total de {clients.length} marcas no carrossel</p>
                </div>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <Users size={40} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 font-light">Nenhum cliente cadastrado. Adicione um ao lado!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                  {clients.map((client) => (
                    <div 
                      key={client.id}
                      className="flex items-center gap-4 bg-neutral-50/40 hover:bg-neutral-50 border border-neutral-100 hover:border-neutral-200/80 rounded-2xl p-4 transition-all duration-300"
                    >
                      {/* Logo Preview Container */}
                      <div className="w-24 h-12 flex-shrink-0 bg-neutral-100/50 border border-neutral-200/50 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                        <img 
                          src={client.logoUrl} 
                          alt={client.name} 
                          className="max-h-full max-w-full object-contain filter hover:brightness-95 transition-all"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                          {client.name}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono mt-1 truncate">
                          {client.logoUrl.startsWith('data:image/svg') 
                            ? "Vetor Tipográfico Auto-gerado" 
                            : client.logoUrl
                          }
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#FF6321] text-neutral-600 hover:text-white border border-neutral-200/60 hover:border-transparent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Editar cliente"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Remover cliente"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "evaluations" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left side: Link Generator & Form */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Link Generator Card */}
              <div className="bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6321]/5 rounded-full blur-3xl" />
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6321]/10 text-[#FF6321]">
                    <Link2 size={16} />
                  </span>
                  Gerar Link de Avaliação
                </h2>
                <p className="text-xs text-neutral-500 font-light mb-6">
                  Selecione um projeto para gerar um link exclusivo de feedback. Envie este link para o seu cliente avaliar diretamente.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <Film size={13} className="text-neutral-400" />
                      Selecione o Projeto
                    </label>
                    <select
                      value={selectedProjectForLink}
                      onChange={(e) => setSelectedProjectForLink(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all font-medium"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateAndCopyLink}
                    className="w-full bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(255,99,33,0.15)] hover:shadow-[0_10px_25px_rgba(255,99,33,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Copy size={16} />
                    {isCopied ? "Link Copiado!" : "Gerar e Copiar Link"}
                  </button>

                  {generatedLink && (
                    <div className="pt-2">
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3 overflow-hidden">
                        <span className="text-xs text-neutral-500 font-mono truncate select-all">
                          {generatedLink}
                        </span>
                        <a
                          href={generatedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF6321] hover:text-orange-600 flex-shrink-0"
                          title="Abrir em nova aba"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Card (Add/Edit Review) */}
              <div className="bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200 shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6321]/10 text-[#FF6321]">
                    {isEditingEval ? <Edit2 size={16} /> : <Plus size={18} />}
                  </span>
                  {isEditingEval ? "Editar Avaliação" : "Criar Avaliação Manual"}
                </h2>

                <form onSubmit={handleEvalSubmit} className="space-y-5">
                  
                  {/* Client Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <User size={13} className="text-neutral-400" />
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nome e Sobrenome"
                      value={evalClientName}
                      onChange={(e) => setEvalClientName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all font-medium"
                    />
                  </div>

                  {/* Project Link Select */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <Film size={13} className="text-neutral-400" />
                      Projeto Vinculado
                    </label>
                    <select
                      value={evalProjectId}
                      onChange={(e) => setEvalProjectId(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all"
                    >
                      <option value="general">Avaliação Geral (Sem Projeto)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating selection (Stars) */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <Star size={13} className="text-neutral-400" />
                      Nota (1 a 5)
                    </label>
                    <div className="flex gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEvalStars(s)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star
                            size={24}
                            className={s <= evalStars ? "fill-[#FF6321] text-[#FF6321]" : "text-neutral-300 hover:text-neutral-400"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <FileText size={13} className="text-neutral-400" />
                      Comentário sobre o Vídeo *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="O que o cliente achou da produção..."
                      value={evalComment}
                      onChange={(e) => setEvalComment(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all font-light resize-none"
                    />
                  </div>

                  {/* Client Photo URL & File Input */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <Image size={13} className="text-neutral-400" />
                      Foto do Cliente (URL ou Arquivo)
                    </label>
                    <input
                      type="url"
                      placeholder="Link HTTP/HTTPS para foto"
                      value={evalPhotoUrl}
                      onChange={(e) => setEvalPhotoUrl(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] transition-all"
                    />
                    <div className="flex items-center gap-3 mt-1">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 cursor-pointer transition-colors">
                        <Upload size={12} className="text-neutral-400" />
                        Enviar do Computador
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                      </label>
                      {evalPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setEvalPhotoUrl("")}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Client Audio URL & File Input */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-2">
                      <Music size={13} className="text-neutral-400" />
                      Áudio do Cliente (URL ou Arquivo)
                    </label>
                    <input
                      type="url"
                      placeholder="Link HTTP/HTTPS para áudio (ex: MP3)"
                      value={evalAudioUrl}
                      onChange={(e) => setEvalAudioUrl(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF6321] transition-all"
                    />
                    <div className="flex items-center gap-3 mt-1">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 cursor-pointer transition-colors">
                        <Upload size={12} className="text-neutral-400" />
                        Enviar do Computador
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileChange}
                          className="hidden"
                        />
                      </label>
                      {evalAudioUrl && (
                        <button
                          type="button"
                          onClick={() => setEvalAudioUrl("")}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(255,99,33,0.15)] hover:shadow-[0_10px_25px_rgba(255,99,33,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isEditingEval ? <Edit2 size={16} /> : <Plus size={16} />}
                      {isEditingEval ? "Salvar Alterações" : "Criar Avaliação"}
                    </button>

                    {isEditingEval && (
                      <button
                        type="button"
                        onClick={handleCancelEvalEdit}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-sm font-semibold py-4 px-6 rounded-xl transition-colors cursor-pointer border border-neutral-200"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>

            {/* Right side: Evaluations List */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Avaliações Ativas</h2>
                  <p className="text-neutral-500 text-sm mt-1 font-light">Total de {evaluations.length} avaliações registradas</p>
                </div>
              </div>

              {evaluations.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                  <Star size={40} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 font-light">Nenhuma avaliação cadastrada ainda. Compartilhe um link para receber!</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[1100px] overflow-y-auto pr-2 custom-scrollbar">
                  {evaluations.map((evaluation) => (
                    <div 
                      key={evaluation.id}
                      className="bg-neutral-50/40 hover:bg-neutral-50 border border-neutral-100 hover:border-neutral-200/80 rounded-2xl p-6 transition-all duration-300 flex flex-col md:flex-row gap-5"
                    >
                      {/* Avatar preview */}
                      <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center self-start shadow-sm">
                        {evaluation.photoUrl ? (
                          <img 
                            src={evaluation.photoUrl} 
                            alt={evaluation.clientName} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[#FF6321]">
                            {evaluation.clientName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                              {evaluation.clientName}
                            </h3>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(evaluation.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          
                          {/* Rating Stars */}
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < evaluation.stars ? "fill-[#FF6321] text-[#FF6321]" : "text-neutral-200"}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Linked Project Badge */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium bg-neutral-100 border border-neutral-200/40 text-neutral-600 px-2.5 py-1 rounded-md">
                            <Film size={10} className="text-[#FF6321]" />
                            {evaluation.projectName}
                          </span>
                        </div>

                        {/* Comment text */}
                        <p className="text-neutral-600 text-sm font-light leading-relaxed mb-4 whitespace-pre-line">
                          "{evaluation.comment}"
                        </p>

                        {/* Audio comments player */}
                        {evaluation.audioUrl && (
                          <div className="p-3 bg-neutral-100 rounded-xl flex items-center gap-4 border border-neutral-200/50 max-w-sm mb-2">
                            <button
                              type="button"
                              onClick={() => handlePlayPauseEvalAudio(evaluation.id, evaluation.audioUrl!)}
                              className="w-10 h-10 rounded-full bg-[#FF6321] text-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow-sm"
                            >
                              {playingAudioId === evaluation.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-neutral-800">Mensagem de Áudio</span>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">Clique para reproduzir o feedback</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 justify-end self-end md:self-start md:items-end">
                        <button
                          onClick={() => handleEditEval(evaluation)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#FF6321] text-[#FF6321] border border-neutral-200/60 hover:border-transparent transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Editar avaliação"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEval(evaluation.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title="Remover avaliação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "leads" && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Leads de Contato</h2>
                <p className="text-neutral-500 text-sm mt-1 font-light">Total de {leads.length} leads recebidos</p>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                <Users size={40} className="text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 font-light">Nenhum lead de contato cadastrado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[1100px] overflow-y-auto pr-2 custom-scrollbar">
                {leads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="bg-neutral-50/40 hover:bg-neutral-50 border border-neutral-100 hover:border-neutral-200/80 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                            {lead.name}
                          </h3>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {new Date(lead.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200/60 hover:border-red-200 transition-all duration-300 cursor-pointer shadow-sm"
                          title="Remover lead"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs mb-4">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <span className="font-semibold text-neutral-800">E-mail:</span>
                          <a href={`mailto:${lead.email}`} className="text-[#FF6321] hover:underline truncate">
                            {lead.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <span className="font-semibold text-neutral-800">Telefone:</span>
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#FF6321] hover:underline flex items-center gap-1 font-mono"
                          >
                            {lead.phone}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-neutral-100">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">Mensagem:</span>
                        <p className="text-neutral-700 text-xs font-light leading-relaxed whitespace-pre-wrap">
                          {lead.message}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                      <a 
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name}, respondo seu contato feito no site Daniel Vale.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <Phone size={12} />
                        Falar no WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        iconType={confirmConfig.iconType}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel={confirmConfig.cancelLabel}
        severity={confirmConfig.severity}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
