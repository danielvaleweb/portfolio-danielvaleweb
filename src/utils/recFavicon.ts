/**
 * recFavicon.ts
 * Simula o indicador de REC idêntico ao botão do site:
 * Um círculo vermelho sólido (#FB2C36) com pulso / ping contínuo
 * diretamente na aba do navegador (favicon).
 */

let activeInterval: number | null = null;

export function initRecFavicon() {
  if (activeInterval !== null) {
    window.clearInterval(activeInterval);
    activeInterval = null;
  }

  // Localiza ou cria o elemento <link rel="icon">
  let faviconLink = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (!faviconLink) {
    faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  }

  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.id = 'app-favicon';
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }

  faviconLink.type = 'image/png';

  // Canvas 32x32 para renderização ultra-nítida
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const TOTAL_FRAMES = 16;
  const INTERVAL_MS = 80; // 16 frames * 80ms ≈ 1.28s por ciclo completo
  const frames: string[] = [];

  // Cor exata do REC (#FB2C36 / rgb(251, 44, 54))
  const RED_COLOR = 'rgb(251, 44, 54)';

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    ctx.clearRect(0, 0, 32, 32);

    const progress = i / TOTAL_FRAMES; // 0.0 até 1.0 (ciclo linear de ping)
    const sinProgress = (Math.sin(progress * Math.PI * 2) + 1) / 2; // curva senoidal para respiração suave

    const centerX = 16;
    const centerY = 16;

    // 1. Onda Ping / Expansão externa (idêntico ao animate-ping do botão REC)
    const pingRadius = 8 + progress * 7; // expande de 8px até 15px
    const pingOpacity = (1 - progress) * 0.75; // esmaece de 0.75 até 0.0

    if (pingOpacity > 0.02) {
      ctx.fillStyle = `rgba(251, 44, 54, ${pingOpacity})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pingRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Círculo Central Sólido (puro, limpo, exatamente como o print do usuário)
    const coreRadius = 7.6 + sinProgress * 0.8; // pulso sutil de 7.6px a 8.4px
    ctx.fillStyle = RED_COLOR;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    frames.push(canvas.toDataURL('image/png'));
  }

  let currentFrame = 0;
  if (frames.length > 0 && frames[0]) {
    faviconLink.href = frames[0];
  }

  activeInterval = window.setInterval(() => {
    currentFrame = (currentFrame + 1) % frames.length;
    if (faviconLink && frames[currentFrame]) {
      faviconLink.href = frames[currentFrame];
    }
  }, INTERVAL_MS);
}
