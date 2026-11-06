import { 
  Project, 
  projects as initialProjects, 
  Client, 
  initialClients, 
  Evaluation, 
  initialEvaluations, 
  Lead, 
  Notification,
  Note,
  FileAsset,
  ChatMessage,
  Conversation,
  EmailItem,
  CalendarEvent,
  KnowledgeArticle,
  SupportTicket
} from "../types";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage, db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { saveGalleryToIndexedDB, getGalleryFromIndexedDB } from "./imageStorage";

const STORAGE_KEY = "daniel_vale_projects";
const DELETED_PROJECTS_KEY = "daniel_vale_deleted_project_ids";
const CLIENTS_STORAGE_KEY = "daniel_vale_clients";
const DELETED_CLIENTS_KEY = "daniel_vale_deleted_client_ids";
const EVALUATIONS_STORAGE_KEY = "daniel_vale_evaluations";
const LEADS_STORAGE_KEY = "daniel_vale_leads";
const NOTIFICATIONS_STORAGE_KEY = "daniel_vale_notifications";
const NOTES_STORAGE_KEY = "daniel_vale_notes";
const FILES_STORAGE_KEY = "daniel_vale_files";
const CONVERSATIONS_STORAGE_KEY = "daniel_vale_conversations";
const EMAILS_STORAGE_KEY = "daniel_vale_emails";
const CALENDAR_STORAGE_KEY = "daniel_vale_calendar";
const KNOWLEDGE_STORAGE_KEY = "daniel_vale_knowledge";

// Known fictitious / placeholder project IDs and titles
export const FICTITIOUS_PROJECT_IDS = new Set([
  "1", "2", "3", "4", "5", "6", "7", "8", "dune", "test_doc"
]);

export const FICTITIOUS_PROJECT_TITLES = [
  "residencial vista linda",
  "space sweepers corporate",
  "mansão skyline penthouse",
  "mansao skyline penthouse",
  "oxygen eco residence",
  "the silence hills",
  "vanguard tower",
  "villa lumina",
  "infinity coast penthouse",
  "dune"
];

export function isFictitiousProject(p: { id?: string; title?: string }): boolean {
  if (!p) return false;
  if (p.id && FICTITIOUS_PROJECT_IDS.has(p.id.toLowerCase())) return true;
  const title = (p.title || "").trim().toLowerCase();
  if (FICTITIOUS_PROJECT_TITLES.some(t => title === t || title.includes(t))) return true;
  return false;
}

// Known fictitious / placeholder client IDs and names
export const FICTITIOUS_CLIENT_IDS = new Set([
  "1", "2", "3", "4", "5", "6", "7", "8", "c_1", "c_2", "c_3", "c_4", "c_5", "test_client", "sample_client"
]);

export const FICTITIOUS_CLIENT_NAMES = [
  "alphaville", "alphaville inc", "residencial alphaville",
  "toscana", "toscana homes",
  "solaris", "solaris design",
  "loft 42", "loft",
  "templo", "templo arquitetura",
  "netflix", "red bull", "sony", "nike", "adidas", "apple", "google", "amazon",
  "warner", "warner bros", "warner music", "hbo", "spotify", "ambev", "globo",
  "empresa alpha", "acme", "demo", "exemplo", "fictício", "ficticio", "test", "teste",
  "cliente 1", "cliente 2", "cliente 3", "client 1", "client 2", "client 3",
  "linea studio", "studio x", "fictitious client", "cliente exemplo", "sample client"
];

export function isFictitiousClient(c: { id?: string; name?: string }): boolean {
  if (!c) return false;
  if (c.id && FICTITIOUS_CLIENT_IDS.has(c.id.toLowerCase())) return true;
  const name = (c.name || "").trim().toLowerCase();
  if (!name) return false;
  return FICTITIOUS_CLIENT_NAMES.some(n => {
    const fn = n.trim().toLowerCase();
    return name === fn || name.includes(fn) || (fn.length > 4 && fn.includes(name));
  });
}

// Helper to track locally deleted client IDs so they don't resurrect if cloud sync occurs
export function getDeletedClientIds(): string[] {
  try {
    const data = localStorage.getItem(DELETED_CLIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addDeletedClientId(id: string): void {
  try {
    const list = getDeletedClientIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn("Could not save deleted client id", e);
  }
}

export function removeDeletedClientId(id: string): void {
  try {
    const list = getDeletedClientIds().filter(i => i !== id);
    localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not remove deleted client id", e);
  }
}

// Clears all fictitious/mock clients from local state and triggers cloud deletion
export function clearFictitiousClients(): number {
  let count = 0;
  FICTITIOUS_CLIENT_IDS.forEach(id => addDeletedClientId(id));

  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (raw) {
      const parsed: Client[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(c => {
          if (isFictitiousClient(c)) {
            addDeletedClientId(c.id);
            count++;
            try {
              deleteDoc(doc(db, "clients", c.id)).catch(() => {});
            } catch {}
            return false;
          }
          return true;
        });
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(cleaned));
      }
    }
  } catch (err) {
    console.warn("Notice clearing fictitious clients from storage", err);
  }

  // Attempt cloud delete for known fictitious client docs
  FICTITIOUS_CLIENT_IDS.forEach(id => {
    try {
      
    } catch {}
  });

  window.dispatchEvent(new Event("clients-updated"));
  return count;
}

export function clearAllClients(): void {
  const list = getClients();
  list.forEach(c => addDeletedClientId(c.id));
  saveClients([]);
  list.forEach(c => {
    try {
      deleteDoc(doc(db, "clients", c.id)).catch(() => {});
    } catch {}
  });
  window.dispatchEvent(new Event("clients-updated"));
}

// Helper to track locally deleted project IDs so they don't resurrect if cloud permissions are pending
export function getDeletedProjectIds(): string[] {
  try {
    const data = localStorage.getItem(DELETED_PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addDeletedProjectId(id: string): void {
  try {
    const list = getDeletedProjectIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn("Could not save deleted project id", e);
  }
}

export function removeDeletedProjectId(id: string): void {
  try {
    const list = getDeletedProjectIds().filter(i => i !== id);
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not remove deleted project id", e);
  }
}

// Clears all fictitious/mock projects from local state and triggers cloud deletion
export function clearFictitiousProjects(): number {
  let count = 0;
  FICTITIOUS_PROJECT_IDS.forEach(id => addDeletedProjectId(id));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Project[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(p => {
          if (isFictitiousProject(p)) {
            addDeletedProjectId(p.id);
            count++;
            return false;
          }
          return true;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    }
  } catch (err) {
    console.warn("Notice clearing fictitious projects from storage", err);
  }

  // Attempt cloud delete for known fictitious docs
  FICTITIOUS_PROJECT_IDS.forEach(id => {
    try {
      deleteDoc(doc(db, "projects", id)).catch(() => {});
    } catch {}
  });

  window.dispatchEvent(new Event("projects-updated"));
  return count;
}

// Helper to remove undefined properties before sending to Firestore
function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Helper to extract numeric creation timestamp from project
export function getProjectTimestamp(p: Partial<Project>): number {
  if (typeof p.createdAt === 'number' && !isNaN(p.createdAt) && p.createdAt > 0) {
    return p.createdAt;
  }
  if (typeof (p as any).createdAt === 'string') {
    const parsed = Date.parse((p as any).createdAt);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (p.id) {
    const num = Number(p.id);
    if (!isNaN(num) && num > 1000000000) {
      return num;
    }
  }
  return 0;
}

// Garante que os conteúdos mais recentes sempre fiquem no início (primeiro do lado esquerdo)
export function sortProjectsByRecent(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const timeA = getProjectTimestamp(a);
    const timeB = getProjectTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA; // Decrescente: o mais recente fica no índice 0 (lado esquerdo)
    }
    return (b.id || "").localeCompare(a.id || "");
  });
}

// Map Firestore document to Project interface
function mapFirestoreProject(docId: string, data: any): Project {
  let createdAt: number | undefined;
  if (typeof data.createdAt === 'number' && !isNaN(data.createdAt)) {
    createdAt = data.createdAt;
  } else if (data.createdAt?.toMillis && typeof data.createdAt.toMillis === 'function') {
    createdAt = data.createdAt.toMillis();
  } else if (typeof data.createdAt?.seconds === 'number') {
    createdAt = data.createdAt.seconds * 1000;
  } else if (typeof data.createdAt === 'string') {
    const parsed = Date.parse(data.createdAt);
    if (!isNaN(parsed) && parsed > 0) createdAt = parsed;
  } else {
    const num = Number(docId);
    if (!isNaN(num) && num > 1000000000) {
      createdAt = num;
    }
  }

  return {
    id: docId,
    title: data.title || "Sem título",
    category: data.category || "portfolio",
    thumbnail: data.thumbnail || data.horizontalThumb || data.backdropUrl || data.verticalPoster || "",
    videoUrl: data.videoUrl || data.trailerUrl || "",
    description: data.description || data.synopsis || "",
    downloadUrl: data.downloadUrl || "",
    isPhotoGallery: Boolean(data.isPhotoGallery),
    images: Array.isArray(data.images) ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    isFavorite: Boolean(data.isFavorite),
    views: typeof data.views === "number" ? data.views : 0,
    clientId: data.clientId || "",
    showClientInfo: data.showClientInfo !== undefined ? Boolean(data.showClientInfo) : Boolean(data.clientId),
    allowDownload: Boolean(data.allowDownload),
    downloadCode: data.downloadCode || "",
    createdAt,
    order: typeof data.order === 'number' ? data.order : undefined
  };
}

// Notifications
export function getNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Notice reading notifications", e);
  }
  return [];
}

export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.warn("Notice saving notifications", e);
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const notifications = getNotifications();
  const newNotif: Notification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  saveNotifications(notifications);
  
  window.dispatchEvent(new Event('notificationsUpdated'));
  return newNotif;
}

export function markNotificationsAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
  window.dispatchEvent(new Event('notificationsUpdated'));
}

export function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  
  const shortsRegExp = /\/shorts\/([a-zA-Z0-9_-]{11})/;
  const shortsMatch = url.match(shortsRegExp);
  if (shortsMatch && shortsMatch[1]) {
    return `https://img.youtube.com/vi/${shortsMatch[1]}/maxresdefault.jpg`;
  }

  return null;
}

// Projects
export function getProjects(): Project[] {
  const deletedIds = getDeletedProjectIds();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed
          .filter((p: Project) => !deletedIds.includes(p.id) && !isFictitiousProject(p))
          .map((p: Project) => (p.category === 'Institucional' ? { ...p, category: 'Eventos' } : p));
        return sortProjectsByRecent(cleaned);
      }
    }
  } catch (error) {
    console.warn("Notice reading projects from storage", error);
  }
  const fallback = initialProjects
    .filter(p => !deletedIds.includes(p.id) && !isFictitiousProject(p))
    .map(p => (p.category === 'Institucional' ? { ...p, category: 'Eventos' } : p));
  return sortProjectsByRecent(fallback);
}

export function saveProjects(projects: Project[]): void {
  try {
    const deletedIds = getDeletedProjectIds();
    // Garante que os mais recentes sempre fiquem no início (primeiro do lado esquerdo)
    const sorted = sortProjectsByRecent(
      projects.filter(p => !deletedIds.includes(p.id) && !isFictitiousProject(p))
    );

    // Salva fotos em IndexedDB para garantir capacidade ilimitada sem estourar o localStorage
    sorted.forEach(p => {
      if (p.images && p.images.length > 0) {
        saveGalleryToIndexedDB(p.id, p.images);
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (quotaError) {
      console.warn("Aviso de cota do localStorage excedida. Armazenando no IndexedDB com backup de fotos no localStorage:", quotaError);
      // Salva apenas as 4 primeiras fotos completas no localStorage caso a cota estoure, sem corromper URLs
      const safeForLocalStorage = sorted.map(p => ({
        ...p,
        images: (p.images || []).slice(0, 4)
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeForLocalStorage));
      } catch {}
    }

    window.dispatchEvent(new Event("projects-updated"));
  } catch (error) {
    console.warn("Notice saving projects to storage", error);
  }
}

export function formatProjectDocId(title: string): string {
  if (!title || !title.trim()) return "PROJETO_" + Date.now();
  return title
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();
}

export function getProjectCategoryCollection(category?: string): 'projetos_imobiliario' | 'projetos_publicidade' | 'projetos_eventos' | 'projetos_institucional' {
  const cat = (category || "").toLowerCase();
  if (cat.includes("publi")) return "projetos_publicidade";
  if (cat.includes("event") || cat.includes("institu")) return "projetos_eventos";
  return "projetos_imobiliario";
}

export function getCategorySlug(category?: string): 'imobiliario' | 'publicidade' | 'eventos' | 'institucional' {
  const cat = (category || "").toLowerCase();
  if (cat.includes("publi")) return "publicidade";
  if (cat.includes("event") || cat.includes("institu")) return "eventos";
  return "imobiliario";
}

export function addProject(newProject: Omit<Project, 'id'>): Project {
  const now = Date.now();
  const id = now.toString();
  removeDeletedProjectId(id);

  const list = getProjects();
  
  // Auto-thumbnail if empty and YouTube URL is provided
  let thumbnail = newProject.thumbnail?.trim();
  if (!thumbnail) {
    const ytThumb = getYouTubeThumbnail(newProject.videoUrl);
    thumbnail = ytThumb || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1600&h=900";
  }

  // Generate code if allowDownload is true and code is not set
  let downloadCode = newProject.downloadCode;
  if (newProject.allowDownload && !downloadCode) {
    downloadCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const project: Project = {
    ...newProject,
    id,
    thumbnail,
    downloadCode,
    showClientInfo: newProject.showClientInfo !== undefined ? newProject.showClientInfo : Boolean(newProject.clientId),
    createdAt: newProject.createdAt || now,
  };
  
  if (project.images && project.images.length > 0) {
    saveGalleryToIndexedDB(project.id, project.images);
  }

  // Update local cache immediately for zero-lag UI (adiciona no início)
  list.unshift(project);
  saveProjects(list);

  const cleanedData = cleanFirestoreData(project);
  const catCollection = getProjectCategoryCollection(project.category);
  const catSlug = getCategorySlug(project.category);
  const docTitleId = formatProjectDocId(project.title);

  // 1. Coleção 'projects' padrão
  setDoc(doc(db, "projects", id), cleanedData).catch((error) => {
    console.warn("Aviso ao sincronizar projeto com Firestore:", error?.message || error);
    if (error?.code === 'permission-denied' || error?.message?.includes("insufficient permissions")) {
      window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
        detail: { collection: "projects", action: "salvar" } 
      }));
    }
  });

  

  return project;
}

export function updateProject(id: string, updatedData: Partial<Project>): void {
  removeDeletedProjectId(id);
  const list = getProjects();
  const index = list.findIndex(p => p.id === id);
  if (index !== -1) {
    let thumbnail = updatedData.thumbnail?.trim() || list[index].thumbnail;
    if (!updatedData.thumbnail && updatedData.videoUrl) {
      const ytThumb = getYouTubeThumbnail(updatedData.videoUrl);
      if (ytThumb) thumbnail = ytThumb;
    }

    let downloadCode = updatedData.downloadCode || list[index].downloadCode;
    if (updatedData.allowDownload && !downloadCode) {
      downloadCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    } else if (updatedData.allowDownload === false) {
      downloadCode = undefined;
    }

    const updatedItem: Project = {
      ...list[index],
      ...updatedData,
      thumbnail,
      downloadCode,
      createdAt: updatedData.createdAt || list[index].createdAt || getProjectTimestamp(list[index]) || Date.now(),
    };

    if (updatedItem.images && updatedItem.images.length > 0) {
      saveGalleryToIndexedDB(id, updatedItem.images);
    }

    list[index] = updatedItem;
    saveProjects(list);

    const cleanedData = cleanFirestoreData(updatedItem);
    const catCollection = getProjectCategoryCollection(updatedItem.category);
    const catSlug = getCategorySlug(updatedItem.category);
    const docTitleId = formatProjectDocId(updatedItem.title);

    // Sync update to Cloud Firestore
    setDoc(doc(db, "projects", id), cleanedData, { merge: true }).catch((error) => {
      console.warn("Aviso ao atualizar projeto no Firestore:", error?.message || error);
      if (error?.code === 'permission-denied' || error?.message?.includes("insufficient permissions")) {
        window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
          detail: { collection: "projects", action: "atualizar" } 
        }));
      }
    });

    // Atualiza na coleção separada por categoria com o Título
    setDoc(doc(db, catCollection, docTitleId), cleanedData, { merge: true }).catch(() => {});

    // Atualiza na coleção hierárquica projetos > categoria > itens
    setDoc(doc(db, "projetos", catSlug, "itens", docTitleId), cleanedData, { merge: true }).catch(() => {});
  }
}

export async function deleteFileFromFirebaseStorage(url?: string): Promise<boolean> {
  if (!url) return false;
  if (!url.includes("firebasestorage.googleapis.com") && !url.startsWith("gs://")) {
    return false;
  }
  try {
    const fileRef = storageRef(storage, url);
    await deleteObject(fileRef);
    console.log("Deleted file from storage:", url);
    return true;
  } catch (error) {
    console.warn("Could not delete file from Firebase Storage:", error);
    return false;
  }
}

export async function deleteProject(id: string): Promise<void> {
  // Mark as deleted locally so it never resurrects in UI
  addDeletedProjectId(id);

  const list = getProjects();
  const project = list.find(p => p.id === id);
  if (project) {
    const filesToDelete: (string | undefined)[] = [
      project.thumbnail,
      project.videoUrl,
      project.downloadUrl,
      ...(project.images || [])
    ];

    await Promise.allSettled(
      filesToDelete.map(url => deleteFileFromFirebaseStorage(url))
    );

    const catCollection = getProjectCategoryCollection(project.category);
    const catSlug = getCategorySlug(project.category);
    const docTitleId = formatProjectDocId(project.title);

    // Exclui das coleções categorizadas
    deleteDoc(doc(db, catCollection, docTitleId)).catch(() => {});
    deleteDoc(doc(db, "projetos", catSlug, "itens", docTitleId)).catch(() => {});
  }

  const filtered = list.filter(p => p.id !== id);
  saveProjects(filtered);

  // Sync deletion with Cloud Firestore
  try {
    await deleteDoc(doc(db, "projects", id));
    console.log("Projeto excluído do Firestore com sucesso:", id);
  } catch (error: any) {
    console.warn("Aviso ao excluir projeto no Firestore (permissão):", error?.message || error);
    if (error?.code === 'permission-denied' || error?.message?.includes("insufficient permissions")) {
      window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
        detail: { collection: "projects", action: "excluir" } 
      }));
    }
  }
}

export function resetProjects(): void {
  try {
    localStorage.removeItem(DELETED_PROJECTS_KEY);
  } catch {}
  clearFictitiousProjects();
  saveProjects([]);
}

// Clients
export function getClients(): Client[] {
  const deletedIds = getDeletedClientIds();
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((c: Client) => !deletedIds.includes(c.id) && !isFictitiousClient(c));
      }
    }
  } catch (error) {
    console.warn("Notice reading clients from storage", error);
  }
  return initialClients.filter(c => !deletedIds.includes(c.id) && !isFictitiousClient(c));
}

export function saveClients(clients: Client[]): void {
  try {
    const deletedIds = getDeletedClientIds();
    const filtered = clients.filter(c => !deletedIds.includes(c.id) && !isFictitiousClient(c));
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("clients-updated"));
  } catch (error) {
    console.warn("Notice saving clients to storage", error);
  }
}

export async function addClient(newClient: Omit<Client, 'id'>): Promise<Client> {
  const list = getClients();
  const id = "c_" + Date.now().toString();
  removeDeletedClientId(id);
  const client: Client = {
    ...newClient,
    id
  };
  list.push(client);
  saveClients(list);

  const cleaned = cleanFirestoreData(client);

  let permissionError: any = null;

  // 1. Salva na coleção 'clientes' do Firestore
  try {
    await setDoc(doc(db, "clientes", id), cleaned);
    console.log("Cliente salvo na coleção 'clientes' com sucesso:", id);
  } catch (err: any) {
    console.warn("Aviso ao salvar cliente na coleção 'clientes' do Firestore:", err?.message || err);
    if (err?.code === 'permission-denied' || err?.message?.includes("insufficient permissions")) {
      permissionError = err;
    }
  }

  // 2. Mantém sincronizado na coleção 'clients'
  // Removido para evitar duplicação

  if (permissionError) {
    window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
      detail: { collection: "clientes", action: "salvar" } 
    }));
    throw permissionError;
  }

  return client;
}

export function updateClient(id: string, updatedData: Partial<Client>): void {
  removeDeletedClientId(id);
  const list = getClients();
  const index = list.findIndex(c => c.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...updatedData
    };
    list[index] = updated;
    saveClients(list);

    const cleaned = cleanFirestoreData(updated);
    setDoc(doc(db, "clientes", id), cleaned, { merge: true }).catch(err => {
      console.warn("Aviso ao atualizar cliente na coleção 'clientes':", err?.message || err);
      if (err?.code === 'permission-denied' || err?.message?.includes("insufficient permissions")) {
        window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
          detail: { collection: "clientes", action: "atualizar" } 
        }));
      }
    });
  }
}

export function deleteClient(id: string): void {
  addDeletedClientId(id);
  const list = getClients();
  const filtered = list.filter(c => c.id !== id);
  saveClients(filtered);

  deleteDoc(doc(db, "clientes", id)).catch(err => {
    console.warn("Aviso ao deletar da coleção 'clientes' no Firestore:", err?.message || err);
    if (err?.code === 'permission-denied' || err?.message?.includes("insufficient permissions")) {
      window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
        detail: { collection: "clientes", action: "excluir" } 
      }));
    }
  });
  
}

export async function syncAllToFirestore(): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    const clients = getClients().filter(c => !isFictitiousClient(c));
    const projects = getProjects().filter(p => !isFictitiousProject(p));
    const notes = getNotes();
    const files = getFiles();
    const conversations = getConversations();
    const emails = getEmails();
    const calendarEvents = getCalendarEvents();
    const knowledgeArticles = getKnowledgeArticles();
    const leads = getLeads();

    // Testa gravação com documento de conexão
    const testDoc = doc(db, "clientes", "_conn_test");
    await setDoc(testDoc, { ping: true, timestamp: Date.now() });
    await deleteDoc(testDoc).catch(() => {});

    // Salva todos os clientes em 'clientes' e 'clients'
    for (const c of clients) {
      const cleaned = cleanFirestoreData(c);
      await setDoc(doc(db, "clientes", c.id), cleaned);
      
    }

    // Salva todos os projetos em 'projects', nas coleções categorizadas com o TÍTULO e na árvore hierárquica
    for (const p of projects) {
      const cleaned = cleanFirestoreData(p);
      const catCol = getProjectCategoryCollection(p.category);
      const catSlug = getCategorySlug(p.category);
      const docTitleId = formatProjectDocId(p.title);

      // Coleção principal 'projects'
      await setDoc(doc(db, "projects", p.id), cleaned);
      // Coleção categorizada (ex: projetos_imobiliario / CASA_ALPHAVILLE)
      await setDoc(doc(db, catCol, docTitleId), cleaned).catch(() => {});
      // Coleção hierárquica (projetos > imobiliario > itens > CASA_ALPHAVILLE)
      await setDoc(doc(db, "projetos", catSlug, "itens", docTitleId), cleaned).catch(() => {});
    }

    // Salva notas
    for (const n of notes) {
      await setDoc(doc(db, "notas", n.id), cleanFirestoreData(n)).catch(() => {});
    }

    // Salva arquivos
    for (const f of files) {
      await setDoc(doc(db, "arquivos", f.id), cleanFirestoreData(f)).catch(() => {});
    }

    // Salva conversas
    for (const cv of conversations) {
      await setDoc(doc(db, "conversas", cv.id), cleanFirestoreData(cv)).catch(() => {});
    }

    // Salva emails
    for (const em of emails) {
      await setDoc(doc(db, "emails", em.id), cleanFirestoreData(em)).catch(() => {});
    }

    // Salva calendário
    for (const ev of calendarEvents) {
      await setDoc(doc(db, "calendario", ev.id), cleanFirestoreData(ev)).catch(() => {});
    }

    // Salva base de conhecimento
    for (const kb of knowledgeArticles) {
      await setDoc(doc(db, "base_conhecimento", kb.id), cleanFirestoreData(kb)).catch(() => {});
    }

    // Salva mensagens / leads
    for (const l of leads) {
      await setDoc(doc(db, "mensagens", l.id), cleanFirestoreData(l)).catch(() => {});
      await setDoc(doc(db, "leads", l.id), cleanFirestoreData(l)).catch(() => {});
    }

    return {
      success: true,
      message: `Sincronização bem-sucedida! Todas as coleções (Projetos Imobiliário, Publicidade, Eventos, Clientes, Notas, Arquivos, Conversas, E-mails, Calendário e Base de Conhecimento) foram sincronizadas com o Cloud Firestore.`
    };
  } catch (err: any) {
    console.error("Erro na sincronização completa:", err);
    if (err?.code === 'permission-denied' || err?.message?.includes("insufficient permissions")) {
      window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
        detail: { collection: "geral", action: "sincronizar" } 
      }));
      return {
        success: false,
        code: 'permission-denied',
        message: "O Firebase bloqueou a gravação por falta de permissão (PERMISSION_DENIED). É necessário liberar as regras na aba 'Regras' do Firebase Console."
      };
    }
    return {
      success: false,
      message: err?.message || "Erro inesperado ao sincronizar com o banco de dados."
    };
  }
}

export function resetClients(): void {
  try {
    localStorage.removeItem(DELETED_CLIENTS_KEY);
  } catch {}
  clearFictitiousClients();
  saveClients([]);
}

// Evaluations
export function getEvaluations(): Evaluation[] {
  try {
    const stored = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Notice reading evaluations from storage", error);
  }
  return initialEvaluations;
}

export function saveEvaluations(evaluations: Evaluation[]): void {
  try {
    localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(evaluations));
    window.dispatchEvent(new Event("evaluations-updated"));
  } catch (error) {
    console.warn("Notice saving evaluations to storage", error);
  }
}

export function addEvaluation(newEval: Omit<Evaluation, 'id' | 'createdAt'>): Evaluation {
  const list = getEvaluations();
  const id = "e_" + Date.now().toString();
  const evaluation: Evaluation = {
    ...newEval,
    id,
    createdAt: new Date().toISOString()
  };
  list.unshift(evaluation);
  saveEvaluations(list);

  setDoc(doc(db, "evaluations", id), cleanFirestoreData(evaluation)).catch(err => {
    console.warn("Aviso ao salvar avaliação no Firestore:", err?.message || err);
  });

  return evaluation;
}

export function updateEvaluation(id: string, updatedData: Partial<Evaluation>): void {
  const list = getEvaluations();
  const index = list.findIndex(e => e.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...updatedData
    };
    list[index] = updated;
    saveEvaluations(list);

    setDoc(doc(db, "evaluations", id), cleanFirestoreData(updated), { merge: true }).catch(err => {
      console.warn("Aviso ao atualizar avaliação no Firestore:", err?.message || err);
    });
  }
}

export function deleteEvaluation(id: string): void {
  const list = getEvaluations();
  const filtered = list.filter(e => e.id !== id);
  saveEvaluations(filtered);

  deleteDoc(doc(db, "evaluations", id)).catch(err => {
    console.warn("Aviso ao deletar avaliação no Firestore:", err?.message || err);
  });
}

export function resetEvaluations(): void {
  saveEvaluations(initialEvaluations);
}

// Leads
export function getLeads(): Lead[] {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Notice reading leads from storage", error);
  }
  return [];
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new Event("leads-updated"));
  } catch (error) {
    console.warn("Notice saving leads to storage", error);
  }
}

export function addLead(newLead: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const list = getLeads();
  const id = "l_" + Date.now().toString();
  const lead: Lead = {
    ...newLead,
    id,
    createdAt: new Date().toISOString()
  };
  list.unshift(lead);
  saveLeads(list);

  setDoc(doc(db, "leads", id), cleanFirestoreData(lead)).catch(err => {
    console.warn("Aviso ao salvar lead no Firestore:", err?.message || err);
  });

  return lead;
}

export function deleteLead(id: string): void {
  const list = getLeads();
  const filtered = list.filter(l => l.id !== id);
  saveLeads(filtered);

  deleteDoc(doc(db, "leads", id)).catch(err => {
    console.warn("Aviso ao deletar lead no Firestore:", err?.message || err);
  });
}

export function resetLeads(): void {
  saveLeads([]);
}

export function updateLeadStatus(id: string, status: 'novo' | 'respondido' | 'arquivado'): void {
  const list = getLeads();
  const index = list.findIndex(l => l.id === id);
  if (index !== -1) {
    list[index].status = status;
    saveLeads(list);
    setDoc(doc(db, "leads", id), { status }, { merge: true }).catch(() => {});
    setDoc(doc(db, "mensagens", id), { status }, { merge: true }).catch(() => {});
  }
}

export const getContactMessages = getLeads;
export const updateContactMessageStatus = updateLeadStatus;
export const deleteContactMessage = deleteLead;

// -------------------------------------------------------------
// NOTAS (Collection: 'notas')
// -------------------------------------------------------------
const INITIAL_NOTES: Note[] = [];

export function getNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading notes", error);
  }
  return INITIAL_NOTES;
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event("notes-updated"));
  } catch (error) {
    console.warn("Notice saving notes", error);
  }
}

export function addNote(newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const list = getNotes();
  const id = "note_" + Date.now().toString();
  const now = new Date().toISOString();
  const note: Note = {
    ...newNote,
    id,
    createdAt: now,
    updatedAt: now
  };
  list.unshift(note);
  saveNotes(list);

  setDoc(doc(db, "notas", id), cleanFirestoreData(note)).catch(err => {
    console.warn("Aviso ao salvar nota no Firestore:", err?.message || err);
  });
  return note;
}

export function updateNote(id: string, updatedData: Partial<Note>): void {
  const list = getNotes();
  const idx = list.findIndex(n => n.id === id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    saveNotes(list);
    setDoc(doc(db, "notas", id), cleanFirestoreData(list[idx]), { merge: true }).catch(() => {});
  }
}

export function deleteNote(id: string): void {
  const list = getNotes();
  const filtered = list.filter(n => n.id !== id);
  saveNotes(filtered);
  deleteDoc(doc(db, "notas", id)).catch(() => {});
}

// -------------------------------------------------------------
// ARQUIVOS (Collection: 'arquivos')
// -------------------------------------------------------------
const INITIAL_FILES: FileAsset[] = [];

export function getFiles(): FileAsset[] {
  try {
    const stored = localStorage.getItem(FILES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading files", error);
  }
  return INITIAL_FILES;
}

export function saveFiles(files: FileAsset[]): void {
  try {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    window.dispatchEvent(new Event("files-updated"));
  } catch (error) {
    console.warn("Notice saving files", error);
  }
}

export function addFile(newFile: Omit<FileAsset, 'id' | 'uploadedAt'>): FileAsset {
  const list = getFiles();
  const id = "file_" + Date.now().toString();
  const file: FileAsset = {
    ...newFile,
    id,
    uploadedAt: new Date().toISOString()
  };
  list.unshift(file);
  saveFiles(list);

  setDoc(doc(db, "arquivos", id), cleanFirestoreData(file)).catch(err => {
    console.warn("Aviso ao salvar arquivo no Firestore:", err?.message || err);
  });
  return file;
}

export function deleteFile(id: string): void {
  const list = getFiles();
  const filtered = list.filter(f => f.id !== id);
  saveFiles(filtered);
  deleteDoc(doc(db, "arquivos", id)).catch(() => {});
}

// -------------------------------------------------------------
// CONVERSAS (Collection: 'conversas')
// -------------------------------------------------------------
const INITIAL_CONVERSATIONS: Conversation[] = [];

export function getConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading conversations", error);
  }
  return INITIAL_CONVERSATIONS;
}

export function saveConversations(convs: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(convs));
    window.dispatchEvent(new Event("conversations-updated"));
  } catch (error) {
    console.warn("Notice saving conversations", error);
  }
}

export function addMessageToConversation(conversationId: string, text: string, isMe = true): void {
  const list = getConversations();
  const idx = list.findIndex(c => c.id === conversationId);
  if (idx !== -1) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: isMe ? "Daniel Vale" : list[idx].clientName,
      text,
      timestamp: timeStr,
      isMe
    };
    list[idx].messages.push(newMsg);
    list[idx].lastMessage = text;
    list[idx].updatedAt = now.toISOString();
    if (!isMe) list[idx].unreadCount += 1;
    saveConversations(list);

    setDoc(doc(db, "conversas", conversationId), cleanFirestoreData(list[idx]), { merge: true }).catch(() => {});
  }
}

export function createConversation(clientName: string, projectName?: string, initialText?: string): Conversation {
  const list = getConversations();
  const id = "conv_" + Date.now();
  const now = new Date();
  const conv: Conversation = {
    id,
    clientName,
    projectName,
    lastMessage: initialText || "Conversa iniciada",
    unreadCount: 0,
    updatedAt: now.toISOString(),
    messages: initialText ? [{
      id: "msg_" + Date.now(),
      sender: "Daniel Vale",
      text: initialText,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }] : []
  };
  list.unshift(conv);
  saveConversations(list);
  setDoc(doc(db, "conversas", id), cleanFirestoreData(conv)).catch(() => {});
  return conv;
}

// -------------------------------------------------------------
// EMAIL (Collection: 'emails')
// -------------------------------------------------------------
const INITIAL_EMAILS: EmailItem[] = [];

export function getEmails(): EmailItem[] {
  try {
    const stored = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading emails", error);
  }
  return INITIAL_EMAILS;
}

export function saveEmails(emails: EmailItem[]): void {
  try {
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
    window.dispatchEvent(new Event("emails-updated"));
  } catch (error) {
    console.warn("Notice saving emails", error);
  }
}

export function sendEmail(email: Omit<EmailItem, 'id' | 'date'>): EmailItem {
  const list = getEmails();
  const id = "em_" + Date.now();
  const item: EmailItem = {
    ...email,
    id,
    date: new Date().toLocaleDateString("pt-BR")
  };
  list.unshift(item);
  saveEmails(list);
  setDoc(doc(db, "emails", id), cleanFirestoreData(item)).catch(() => {});
  return item;
}

// -------------------------------------------------------------
// CALENDARIO (Collection: 'calendario')
// -------------------------------------------------------------
const todayStr = new Date().toISOString().split("T")[0];
const nextWeekDate = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
const nextMonthDate = new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0];

const INITIAL_EVENTS: CalendarEvent[] = [];

export function getCalendarEvents(): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading calendar", error);
  }
  return INITIAL_EVENTS;
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event("calendar-updated"));
  } catch (error) {
    console.warn("Notice saving calendar", error);
  }
}

export function addCalendarEvent(newEvent: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const list = getCalendarEvents();
  const id = "evt_" + Date.now();
  const event: CalendarEvent = {
    ...newEvent,
    id
  };
  list.push(event);
  // Sort by date
  list.sort((a, b) => a.date.localeCompare(b.date));
  saveCalendarEvents(list);
  setDoc(doc(db, "calendario", id), cleanFirestoreData(event)).catch(() => {});
  return event;
}

export function updateCalendarEvent(id: string, updated: Partial<CalendarEvent>): void {
  const list = getCalendarEvents();
  const idx = list.findIndex(e => e.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updated };
    saveCalendarEvents(list);
    setDoc(doc(db, "calendario", id), cleanFirestoreData(list[idx]), { merge: true }).catch(() => {});
  }
}

export function deleteCalendarEvent(id: string): void {
  const list = getCalendarEvents();
  const filtered = list.filter(e => e.id !== id);
  saveCalendarEvents(filtered);
  deleteDoc(doc(db, "calendario", id)).catch(() => {});
}

// -------------------------------------------------------------
// BASE DE CONHECIMENTO (Collection: 'base_conhecimento')
// -------------------------------------------------------------
const INITIAL_KNOWLEDGE: KnowledgeArticle[] = [];

export function getKnowledgeArticles(): KnowledgeArticle[] {
  try {
    const stored = localStorage.getItem(KNOWLEDGE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading knowledge articles", error);
  }
  return INITIAL_KNOWLEDGE;
}

export function saveKnowledgeArticles(articles: KnowledgeArticle[]): void {
  try {
    localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(articles));
    window.dispatchEvent(new Event("knowledge-updated"));
  } catch (error) {
    console.warn("Notice saving knowledge", error);
  }
}

export function addKnowledgeArticle(newArticle: Omit<KnowledgeArticle, 'id'>): KnowledgeArticle {
  const list = getKnowledgeArticles();
  const id = "kb_" + Date.now();
  const article: KnowledgeArticle = {
    ...newArticle,
    id
  };
  list.unshift(article);
  saveKnowledgeArticles(list);
  setDoc(doc(db, "base_conhecimento", id), cleanFirestoreData(article)).catch(() => {});
  return article;
}

export function deleteKnowledgeArticle(id: string): void {
  const list = getKnowledgeArticles().filter(a => a.id !== id);
  saveKnowledgeArticles(list);
  deleteDoc(doc(db, "base_conhecimento", id)).catch(() => {});
}

// -------------------------------------------------------------
// SUPORTE (Collection: 'suporte')
// -------------------------------------------------------------
const SUPPORT_STORAGE_KEY = "animasystem_support_tickets";

const INITIAL_TICKETS: SupportTicket[] = [];

export function getSupportTickets(): SupportTicket[] {
  try {
    const stored = localStorage.getItem(SUPPORT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn("Notice reading tickets", error);
  }
  return INITIAL_TICKETS;
}

export function saveSupportTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event("support-tickets-updated"));
  } catch (error) {
    console.warn("Notice saving tickets", error);
  }
}

export function addSupportTicket(newTicket: Omit<SupportTicket, 'id' | 'createdAt'>): SupportTicket {
  const list = getSupportTickets();
  const id = "tk_" + Date.now();
  const ticket: SupportTicket = {
    ...newTicket,
    id,
    createdAt: new Date().toISOString()
  };
  list.unshift(ticket);
  saveSupportTickets(list);
  setDoc(doc(db, "suporte", id), cleanFirestoreData(ticket)).catch(() => {});
  return ticket;
}

// Automatic cleanup and real-time synchronization listeners with Cloud Firestore
if (typeof window !== "undefined") {
  // Purge any fictitious projects and clients from local storage immediately on startup
  clearFictitiousProjects();
  clearFictitiousClients();

  // 1. Projects listener
  try {
    onSnapshot(collection(db, "projects"), (snapshot) => {
      if (!snapshot.empty) {
        const deletedIds = getDeletedProjectIds();
        const firestoreProjects: Project[] = snapshot.docs
          .filter(docSnap => !deletedIds.includes(docSnap.id) && !FICTITIOUS_PROJECT_IDS.has(docSnap.id.toLowerCase()))
          .map(docSnap => mapFirestoreProject(docSnap.id, docSnap.data()))
          .filter(p => !isFictitiousProject(p));
        
        // Preserva imagens locais para que dados recém-salvos nunca sejam apagados por snapshot do Firestore
        const localProjects = getProjects();
        const mergedProjects = firestoreProjects.map(fp => {
          const lp = localProjects.find(p => p.id === fp.id);
          if (lp && lp.images && lp.images.length > 0) {
            if (!fp.images || fp.images.length === 0 || fp.images.length < lp.images.length) {
              return { ...fp, images: lp.images };
            }
          }
          return fp;
        });

        // Mantém projetos criados localmente ainda não refletidos no Firestore
        localProjects.forEach(lp => {
          if (!mergedProjects.some(mp => mp.id === lp.id) && !deletedIds.includes(lp.id) && !isFictitiousProject(lp)) {
            mergedProjects.push(lp);
          }
        });

        // Garante sempre ordenação com os mais recentes primeiro (lado esquerdo)
        const sortedProjects = sortProjectsByRecent(mergedProjects);

        sortedProjects.forEach(p => {
          if (p.images && p.images.length > 0) {
            saveGalleryToIndexedDB(p.id, p.images);
          }
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedProjects));
        } catch {}
        window.dispatchEvent(new Event("projects-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot projects listener:", error.message);
    });
  } catch (err) {
    console.warn("Could not attach Firestore projects listener:", err);
  }

  // 2. Clientes listener (Coleção "clientes" no Cloud Firestore)
  try {
    onSnapshot(collection(db, "clientes"), (snapshot) => {
      const deletedIds = getDeletedClientIds();
      if (!snapshot.empty) {
        snapshot.docs.forEach(d => {
          const data = d.data();
          if (isFictitiousClient({ id: d.id, name: data.name })) {
            addDeletedClientId(d.id);
            try {
              deleteDoc(doc(db, "clientes", d.id)).catch(() => {});
              deleteDoc(doc(db, "clients", d.id)).catch(() => {});
            } catch {}
          }
        });

        const list = snapshot.docs
          .filter(d => !deletedIds.includes(d.id) && !FICTITIOUS_CLIENT_IDS.has(d.id.toLowerCase()))
          .map(d => ({ id: d.id, ...d.data() } as Client))
          .filter(c => !isFictitiousClient(c));
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("clients-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot clientes listener:", error.message);
    });
  } catch (err) {}

  

  // 3. Evaluations listener
  try {
    onSnapshot(collection(db, "evaluations"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation));
        localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("evaluations-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot evaluations listener:", error.message);
    });
  } catch (err) {}

  // 4. Leads / Mensagens listener
  try {
    onSnapshot(collection(db, "leads"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("leads-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot leads listener:", error.message);
    });
  } catch (err) {}

  // 5. Notas listener
  try {
    onSnapshot(collection(db, "notas"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Note));
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("notes-updated"));
      }
    }, () => {});
  } catch (err) {}

  // 6. Arquivos listener
  try {
    onSnapshot(collection(db, "arquivos"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FileAsset));
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("files-updated"));
      }
    }, () => {});
  } catch (err) {}

  // 7. Conversas listener
  try {
    onSnapshot(collection(db, "conversas"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
        localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("conversations-updated"));
      }
    }, () => {});
  } catch (err) {}

  // 8. Calendário listener
  try {
    onSnapshot(collection(db, "calendario"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("calendar-updated"));
      }
    }, () => {});
  } catch (err) {}
}

