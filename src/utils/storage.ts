import { Project, projects as initialProjects, Client, initialClients, Evaluation, initialEvaluations, Lead } from "../types";

const STORAGE_KEY = "daniel_vale_projects";
const CLIENTS_STORAGE_KEY = "daniel_vale_clients";
const EVALUATIONS_STORAGE_KEY = "daniel_vale_evaluations";
const LEADS_STORAGE_KEY = "daniel_vale_leads";

// Try to extract YouTube video ID to auto-generate thumbnail
export function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  
  // YouTube shorts check
  const shortsRegExp = /\/shorts\/([a-zA-Z0-9_-]{11})/;
  const shortsMatch = url.match(shortsRegExp);
  if (shortsMatch && shortsMatch[1]) {
    return `https://img.youtube.com/vi/${shortsMatch[1]}/maxresdefault.jpg`;
  }

  return null;
}

export function getProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First time, save initial projects to local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjects));
      return initialProjects;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading projects from storage", error);
    return initialProjects;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    // Trigger custom event so other components can listen to storage changes
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

  const project: Project = {
    ...newProject,
    id,
    thumbnail
  };
  
  list.unshift(project); // Add to the beginning of list
  saveProjects(list);
  return project;
}

export function updateProject(id: string, updatedData: Partial<Project>): void {
  const list = getProjects();
  const index = list.findIndex(p => p.id === id);
  if (index !== -1) {
    // Auto-thumbnail check if videoUrl is changed and thumbnail is empty
    let thumbnail = updatedData.thumbnail?.trim() || list[index].thumbnail;
    if (!updatedData.thumbnail && updatedData.videoUrl) {
      const ytThumb = getYouTubeThumbnail(updatedData.videoUrl);
      if (ytThumb) thumbnail = ytThumb;
    }

    list[index] = {
      ...list[index],
      ...updatedData,
      thumbnail
    };
    saveProjects(list);
  }
}

export function deleteProject(id: string): void {
  const list = getProjects();
  const filtered = list.filter(p => p.id !== id);
  saveProjects(filtered);
}

export function resetProjects(): void {
  saveProjects(initialProjects);
}

export function getClients(): Client[] {
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading clients from storage", error);
    return initialClients;
  }
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
  list.push(client); // Add to the end of list
  saveClients(list);
  return client;
}

export function updateClient(id: string, updatedData: Partial<Client>): void {
  const list = getClients();
  const index = list.findIndex(c => c.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...updatedData
    };
    saveClients(list);
  }
}

export function deleteClient(id: string): void {
  const list = getClients();
  const filtered = list.filter(c => c.id !== id);
  saveClients(filtered);
}

export function resetClients(): void {
  saveClients(initialClients);
}

export function getEvaluations(): Evaluation[] {
  try {
    const stored = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(initialEvaluations));
      return initialEvaluations;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading evaluations from storage", error);
    return initialEvaluations;
  }
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
  return evaluation;
}

export function updateEvaluation(id: string, updatedData: Partial<Evaluation>): void {
  const list = getEvaluations();
  const index = list.findIndex(e => e.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...updatedData
    };
    saveEvaluations(list);
  }
}

export function deleteEvaluation(id: string): void {
  const list = getEvaluations();
  const filtered = list.filter(e => e.id !== id);
  saveEvaluations(filtered);
}

export function resetEvaluations(): void {
  saveEvaluations(initialEvaluations);
}

export function getLeads(): Lead[] {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading leads from storage", error);
    return [];
  }
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
  return lead;
}

export function deleteLead(id: string): void {
  const list = getLeads();
  const filtered = list.filter(l => l.id !== id);
  saveLeads(filtered);
}

export function resetLeads(): void {
  saveLeads([]);
}

