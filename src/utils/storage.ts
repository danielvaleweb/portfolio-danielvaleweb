import { Project, projects as initialProjects, Client, initialClients, Evaluation, initialEvaluations, Lead, Notification } from "../types";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage, db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";

const STORAGE_KEY = "daniel_vale_projects";
const CLIENTS_STORAGE_KEY = "daniel_vale_clients";
const EVALUATIONS_STORAGE_KEY = "daniel_vale_evaluations";
const LEADS_STORAGE_KEY = "daniel_vale_leads";
const NOTIFICATIONS_STORAGE_KEY = "daniel_vale_notifications";

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

// Map Firestore document to Project interface
function mapFirestoreProject(docId: string, data: any): Project {
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
    allowDownload: Boolean(data.allowDownload),
    downloadCode: data.downloadCode || ""
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
    console.error("Error reading notifications", e);
  }
  return [];
}

export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Error saving notifications", e);
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading projects from storage", error);
  }
  return initialProjects;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("projects-updated"));
  } catch (error) {
    console.error("Error saving projects to storage", error);
  }
}

export function addProject(newProject: Omit<Project, 'id'>): Project {
  const list = getProjects();
  const id = Date.now().toString();
  
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
    downloadCode
  };
  
  // Update local cache immediately for zero-lag UI
  list.unshift(project);
  saveProjects(list);

  // Sync to Cloud Firestore so everyone can see it
  setDoc(doc(db, "projects", id), cleanFirestoreData(project))
    .then(() => {
      console.log("Projeto salvo no Firestore com sucesso:", id);
    })
    .catch((error) => {
      console.error("Erro ao salvar projeto no Firestore:", error);
      if (error?.code === 'permission-denied') {
        window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
          detail: { collection: "projects", action: "salvar" } 
        }));
      }
    });

  return project;
}

export function updateProject(id: string, updatedData: Partial<Project>): void {
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
      downloadCode
    };

    list[index] = updatedItem;
    saveProjects(list);

    // Sync update to Cloud Firestore
    setDoc(doc(db, "projects", id), cleanFirestoreData(updatedItem), { merge: true })
      .then(() => {
        console.log("Projeto atualizado no Firestore:", id);
      })
      .catch((error) => {
        console.error("Erro ao atualizar projeto no Firestore:", error);
        if (error?.code === 'permission-denied') {
          window.dispatchEvent(new CustomEvent("firestore-permission-error", { 
            detail: { collection: "projects", action: "atualizar" } 
          }));
        }
      });
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
  }

  const filtered = list.filter(p => p.id !== id);
  saveProjects(filtered);

  // Sync deletion with Cloud Firestore
  try {
    await deleteDoc(doc(db, "projects", id));
    console.log("Projeto excluído do Firestore:", id);
  } catch (error) {
    console.error("Erro ao excluir projeto no Firestore:", error);
  }
}

export function resetProjects(): void {
  saveProjects(initialProjects);
}

// Clients
export function getClients(): Client[] {
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading clients from storage", error);
  }
  return initialClients;
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    window.dispatchEvent(new Event("clients-updated"));
  } catch (error) {
    console.error("Error saving clients to storage", error);
  }
}

export function addClient(newClient: Omit<Client, 'id'>): Client {
  const list = getClients();
  const id = "c_" + Date.now().toString();
  const client: Client = {
    ...newClient,
    id
  };
  list.push(client);
  saveClients(list);

  setDoc(doc(db, "clients", id), cleanFirestoreData(client)).catch(err => {
    console.error("Erro ao salvar cliente no Firestore:", err);
  });

  return client;
}

export function updateClient(id: string, updatedData: Partial<Client>): void {
  const list = getClients();
  const index = list.findIndex(c => c.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...updatedData
    };
    list[index] = updated;
    saveClients(list);

    setDoc(doc(db, "clients", id), cleanFirestoreData(updated), { merge: true }).catch(err => {
      console.error("Erro ao atualizar cliente no Firestore:", err);
    });
  }
}

export function deleteClient(id: string): void {
  const list = getClients();
  const filtered = list.filter(c => c.id !== id);
  saveClients(filtered);

  deleteDoc(doc(db, "clients", id)).catch(err => {
    console.error("Erro ao deletar cliente no Firestore:", err);
  });
}

export function resetClients(): void {
  saveClients(initialClients);
}

// Evaluations
export function getEvaluations(): Evaluation[] {
  try {
    const stored = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading evaluations from storage", error);
  }
  return initialEvaluations;
}

export function saveEvaluations(evaluations: Evaluation[]): void {
  try {
    localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(evaluations));
    window.dispatchEvent(new Event("evaluations-updated"));
  } catch (error) {
    console.error("Error saving evaluations to storage", error);
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
    console.error("Erro ao salvar avaliação no Firestore:", err);
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
      console.error("Erro ao atualizar avaliação no Firestore:", err);
    });
  }
}

export function deleteEvaluation(id: string): void {
  const list = getEvaluations();
  const filtered = list.filter(e => e.id !== id);
  saveEvaluations(filtered);

  deleteDoc(doc(db, "evaluations", id)).catch(err => {
    console.error("Erro ao deletar avaliação no Firestore:", err);
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
    console.error("Error reading leads from storage", error);
  }
  return [];
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new Event("leads-updated"));
  } catch (error) {
    console.error("Error saving leads to storage", error);
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
    console.error("Erro ao salvar lead no Firestore:", err);
  });

  return lead;
}

export function deleteLead(id: string): void {
  const list = getLeads();
  const filtered = list.filter(l => l.id !== id);
  saveLeads(filtered);

  deleteDoc(doc(db, "leads", id)).catch(err => {
    console.error("Erro ao deletar lead no Firestore:", err);
  });
}

export function resetLeads(): void {
  saveLeads([]);
}

// Real-time synchronization listeners with Cloud Firestore
if (typeof window !== "undefined") {
  // 1. Projects listener
  try {
    onSnapshot(collection(db, "projects"), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreProjects: Project[] = snapshot.docs.map(docSnap => 
          mapFirestoreProject(docSnap.id, docSnap.data())
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreProjects));
        window.dispatchEvent(new Event("projects-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot projects listener:", error.message);
    });
  } catch (err) {
    console.warn("Could not attach Firestore projects listener:", err);
  }

  // 2. Clients listener
  try {
    onSnapshot(collection(db, "clients"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Client));
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("clients-updated"));
      }
    }, (error) => {
      console.warn("Firestore snapshot clients listener:", error.message);
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

  // 4. Leads listener
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
}
