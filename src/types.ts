export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
  downloadUrl?: string;
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Alphaville Casa A-34',
    category: 'Imobiliário',
    thumbnail: 'https://res.cloudinary.com/dgarqyegu/image/upload/v1774923378/20251105_174909_x95isr.jpg',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '2',
    title: 'Alphaville casa Linea',
    category: 'Imobiliário',
    thumbnail: 'https://res.cloudinary.com/dgarqyegu/image/upload/v1775010065/1.1.1_1.1.1_ual3on.png',
    videoUrl: 'https://youtube.com/shorts/MB3s3KlZ6XA',
  },
  {
    id: '3',
    title: 'Mansão do Lago',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house3/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '4',
    title: 'Apartamento Loft 42',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house4/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '5',
    title: 'Condomínio Solar',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house5/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '6',
    title: 'Villa Toscana',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house6/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '7',
    title: 'Residencial Park',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house7/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '8',
    title: 'Edifício Central',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house8/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '9',
    title: 'Casa da Montanha',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house9/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '10',
    title: 'Loft Industrial',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house10/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '11',
    title: 'Pousada Mar',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house11/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
  {
    id: '12',
    title: 'Sítio Primavera',
    category: 'Imobiliário',
    thumbnail: 'https://picsum.photos/seed/house12/1600/900',
    videoUrl: 'https://www.youtube.com/shorts/r5yn3RunfMk',
  },
];

export interface Client {
  id: string;
  name: string;
  logoUrl: string; // Supported: normal URLs or inline SVG Data URIs
}

export const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Linea Studio',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="20" fill="%23111" letter-spacing="4">LINEA</text></svg>`,
  },
  {
    id: 'c2',
    name: 'Alphaville Inc',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="900" font-size="16" fill="%23111" letter-spacing="6">ALPHAVILLE</text></svg>`,
  },
  {
    id: 'c3',
    name: 'Toscana Homes',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, serif" font-weight="500" font-style="italic" font-size="22" fill="%23111" letter-spacing="3">Toscana</text></svg>`,
  },
  {
    id: 'c4',
    name: 'Solaris Design',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><circle cx="24" cy="20" r="5" fill="%23FF6321"/><text x="88" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="18" fill="%23111" letter-spacing="3">SOLARIS</text></svg>`,
  },
  {
    id: 'c5',
    name: 'Loft 42',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><rect x="10" y="8" width="32" height="24" fill="%23111"/><text x="26" y="21" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="900" font-size="13" fill="%23FFF">L42</text><text x="96" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800" font-size="18" fill="%23111" letter-spacing="2">LOFT 42</text></svg>`,
  },
  {
    id: 'c6',
    name: 'Templo Arquitetura',
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="300" font-size="21" fill="%23111" letter-spacing="5">TEMPLO</text><line x1="35" y1="31" x2="115" y2="31" stroke="%23111" stroke-width="1.5"/></svg>`,
  },
];

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

export const initialEvaluations: Evaluation[] = [
  {
    id: 'e1',
    projectId: '2',
    projectName: 'Alphaville casa Linea',
    clientName: 'Ricardo Souza',
    stars: 5,
    comment: 'Trabalho impecável na gravação e edição do vídeo da Casa Linea. Conseguiu capturar toda a sofisticação da arquitetura. Excelente profissional!',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'e2',
    projectId: '1',
    projectName: 'Alphaville Casa A-34',
    clientName: 'Patrícia Mendes',
    stars: 5,
    comment: 'Ficamos extremamente satisfeitos com o resultado do vídeo promocional. O dinamismo, ritmo das transições e a paleta de cores superaram nossas expectativas.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    createdAt: '2026-07-02T15:30:00Z'
  }
];

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
}


