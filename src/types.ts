export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
  downloadUrl?: string;
  isPhotoGallery?: boolean;
  images?: string[];
  tags?: string[];
  isFavorite?: boolean;
  views?: number;
  clientId?: string;
  showClientInfo?: boolean;
  allowDownload?: boolean;
  downloadCode?: string;
  createdAt?: number;
  order?: number;
}

export const projects: Project[] = [];


export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  instagram?: string;
  logoUrl: string; // Supported: normal URLs or inline SVG Data URIs / Base64
}

export const initialClients: Client[] = [];

export interface Evaluation {
  id: string;
  projectId: string; // can be "general"
  projectName: string;
  clientName: string; // Nome e sobrenome
  stars: number; // 1 to 5
  comment: string; // comentário sobre o vídeo
  photoUrl?: string; // photo
  audioUrl?: string; // audio (can be a base64 Data URL or remote URL)
  createdAt: string;
}

export const initialEvaluations: Evaluation[] = [];

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  status?: 'novo' | 'respondido' | 'arquivado';
}

export type ContactMessage = Lead;

export interface Notification {
  id: string;
  projectId?: string;
  projectName?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: 'Geral' | 'Ideias' | 'Roteiros' | 'Reuniões' | string;
  projectId?: string;
  projectName?: string;
  isPinned?: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAsset {
  id: string;
  name: string;
  url: string;
  size: string; // e.g., '14.2 MB'
  type: 'video' | 'image' | 'document' | 'audio' | 'archive';
  category: 'Imobiliário' | 'Publicidade' | 'Eventos' | 'Institucional' | 'Geral';
  projectId?: string;
  projectName?: string;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  clientName: string;
  clientLogo?: string;
  projectName?: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface EmailItem {
  id: string;
  to: string;
  subject: string;
  body: string;
  templateType?: 'avaliacao' | 'aprovacao' | 'download' | 'briefing' | 'personalizado';
  status: 'enviado' | 'rascunho' | 'recebido';
  date: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'filmagem' | 'entrega' | 'reuniao' | 'outro';
  category?: string;
  status?: 'pendente' | 'agendado' | 'concluido' | 'cancelado';
  clientName?: string;
  projectName?: string;
  location?: string;
  notes?: string;
  completed?: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Equipamentos' | 'Color Grading' | 'Drone & Regulamentação' | 'Workflow & Entrega' | 'Áudio';
  excerpt: string;
  content: string;
  readTime: string;
  tags: string[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta';
  status: 'aberto' | 'em_andamento' | 'resolvido';
  createdAt: string;
}

