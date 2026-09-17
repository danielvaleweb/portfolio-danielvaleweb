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
  allowDownload?: boolean;
  downloadCode?: string;
}

export const projects: Project[] = [];


export interface Client {
  id: string;
  name: string;
  logoUrl: string; // Supported: normal URLs or inline SVG Data URIs
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
}



export interface Notification {
  id: string;
  projectId?: string;
  projectName?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
