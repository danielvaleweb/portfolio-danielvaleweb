import times from "./times";
import createCanvas from "./create-canvas";
import { random, chance } from "./random";

const dropSize = 64;

interface DropItem {
  x: number;
  y: number;
  r: number;
  spreadX: number;
  spreadY: number;
  momentum: number;
  momentumX: number;
  lastSpawn: number;
  nextSpawn: number;
  parent: DropItem | null;
  isNew: boolean;
  killed: boolean;
  shrink: number;
}

function createNewDrop(options: Partial<DropItem> = {}): DropItem {
  return {
    x: 0,
    y: 0,
    r: 0,
    spreadX: 0,
    spreadY: 0,
    momentum: 0,
    momentumX: 0,
    lastSpawn: 0,
    nextSpawn: 0,
    parent: null,
    isNew: true,
    killed: false,
    shrink: 0,
    ...options,
  };
}

export interface RaindropOptions {
  minR: number;
  maxR: number;
  maxDrops: number;
  rainChance: number;
  rainLimit: number;
  dropletsRate: number;
  dropletsSize: [number, number];
  dropletsCleaningRadiusMultiplier: number;
  raining: boolean;
  globalTimeScale: number;
  trailRate: number;
  autoShrink: boolean;
  spawnArea: [number, number];
  trailScaleRange: [number, number];
  collisionRadius: number;
  collisionRadiusIncrease: number;
  dropFallMultiplier: number;
  collisionBoostMultiplier: number;
  collisionBoost: number;
  drizzle?: number;
}

const defaultOptions: RaindropOptions = {
  minR: 10,
  maxR: 40,
  maxDrops: 900,
  rainChance: 0.3,
  rainLimit: 3,
  dropletsRate: 50,
  dropletsSize: [2, 4],
  dropletsCleaningRadiusMultiplier: 0.43,
  raining: true,
  globalTimeScale: 1,
  trailRate: 1,
  autoShrink: true,
  spawnArea: [-0.1, 0.95],
  trailScaleRange: [0.2, 0.5],
  collisionRadius: 0.65,
  collisionRadiusIncrease: 0.01,
  dropFallMultiplier: 1,
  collisionBoostMultiplier: 0.05,
  collisionBoost: 1,
};

export default class Raindrops {
  width: number;
  height: number;
  scale: number;
  dropAlpha: HTMLImageElement;
  dropColor: HTMLImageElement;
  options: RaindropOptions;

  canvas: HTMLCanvasElement = null as any;
  ctx: CanvasRenderingContext2D = null as any;
  droplets: HTMLCanvasElement = null as any;
  dropletsCtx: CanvasRenderingContext2D = null as any;
  dropletsPixelDensity: number = 1;
  dropletsCounter: number = 0;
  drops: DropItem[] = [];
  dropsGfx: HTMLCanvasElement[] = [];
  clearDropletsGfx: HTMLCanvasElement = null as any;
  textureCleaningIterations: number = 0;
  lastRender: number | null = null;
  animationFrameId: number | null = null;
  destroyed: boolean = false;
  timeoutIDs: number[] = [];

  constructor(
    width: number,
    height: number,
    scale: number,
    dropAlpha: HTMLImageElement,
    dropColor: HTMLImageElement,
    options: Partial<RaindropOptions> = {}
  ) {
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.dropAlpha = dropAlpha;
    this.dropColor = dropColor;
    this.options = { ...defaultOptions, ...options };
    this.init();
  }

  get deltaR(): number {
    return this.options.maxR - this.options.minR;
  }

  get area(): number {
    return (this.width * this.height) / this.scale;
  }

  get areaMultiplier(): number {
    return Math.sqrt(this.area / (1024 * 768));
  }

  init(): void {
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.droplets = createCanvas(
      this.width * this.dropletsPixelDensity,
      this.height * this.dropletsPixelDensity
    );
    this.dropletsCtx = this.droplets.getContext("2d")!;

    this.drops = [];
    this.dropsGfx = [];

    this.renderDropsGfx();
    this.update();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.timeoutIDs.forEach((id) => clearTimeout(id));
    this.timeoutIDs = [];
  }

  renderDropsGfx(): void {
    const dropBuffer = createCanvas(dropSize, dropSize);
    const dropBufferCtx = dropBuffer.getContext("2d")!;
    this.dropsGfx = Array.apply(null, Array(255) as any).map((_, i) => {
      const drop = createCanvas(dropSize, dropSize);
      const dropCtx = drop.getContext("2d")!;

      dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

      dropBufferCtx.globalCompositeOperation = "source-over";
      dropBufferCtx.drawImage(this.dropColor, 0, 0, dropSize, dropSize);

      dropBufferCtx.globalCompositeOperation = "screen";
      dropBufferCtx.fillStyle = "rgba(0,0," + i + ",1)";
      dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

      dropCtx.globalCompositeOperation = "source-over";
      dropCtx.drawImage(this.dropAlpha, 0, 0, dropSize, dropSize);

      dropCtx.globalCompositeOperation = "source-in";
      dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
      return drop;
    });

    this.clearDropletsGfx = createCanvas(128, 128);
    const clearDropletsCtx = this.clearDropletsGfx.getContext("2d")!;
    clearDropletsCtx.fillStyle = "#000";
    clearDropletsCtx.beginPath();
    clearDropletsCtx.arc(64, 64, 64, 0, Math.PI * 2);
    clearDropletsCtx.fill();
  }

  drawDroplet(x: number, y: number, r: number): void {
    this.drawDrop(
      this.dropletsCtx,
      createNewDrop({
        x: x * this.dropletsPixelDensity,
        y: y * this.dropletsPixelDensity,
        r: r * this.dropletsPixelDensity,
      })
    );
  }

  drawDrop(ctx: CanvasRenderingContext2D, drop: DropItem): void {
    if (this.dropsGfx.length > 0) {
      const x = drop.x;
      const y = drop.y;
      const r = drop.r;
      const spreadX = drop.spreadX;
      const spreadY = drop.spreadY;

      const scaleX = 1;
      const scaleY = 1.5;

      let d = Math.max(0, Math.min(1, ((r - this.options.minR) / this.deltaR) * 0.9));
      d *= 1 / ((drop.spreadX + drop.spreadY) * 0.5 + 1);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      const idx = Math.floor(d * (this.dropsGfx.length - 1));
      ctx.drawImage(
        this.dropsGfx[idx],
        (x - r * scaleX * (spreadX + 1)) * this.scale,
        (y - r * scaleY * (spreadY + 1)) * this.scale,
        r * 2 * scaleX * (spreadX + 1) * this.scale,
        r * 2 * scaleY * (spreadY + 1) * this.scale
      );
    }
  }

  clearDroplets(x: number, y: number, r: number = 30): void {
    const ctx = this.dropletsCtx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(
      this.clearDropletsGfx,
      (x - r) * this.dropletsPixelDensity * this.scale,
      (y - r) * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale * 1.5
    );
  }

  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  createDrop(options: Partial<DropItem>): DropItem | null {
    if (this.drops.length >= this.options.maxDrops * this.areaMultiplier) return null;
    return createNewDrop(options);
  }

  updateRain(timeScale: number): DropItem[] {
    const rainDrops: DropItem[] = [];
    if (this.options.raining) {
      const limit = this.options.rainLimit * timeScale * this.areaMultiplier;
      let count = 0;
      while (chance(this.options.rainChance * timeScale * this.areaMultiplier) && count < limit) {
        count++;
        const r = random(this.options.minR, this.options.maxR, (n) => Math.pow(n, 3));
        const rainDrop = this.createDrop({
          x: random(this.width / this.scale),
          y: random(
            (this.height / this.scale) * this.options.spawnArea[0],
            (this.height / this.scale) * this.options.spawnArea[1]
          ),
          r: r,
          momentum: 1 + (r - this.options.minR) * 0.1 + random(2),
          spreadX: 1.5,
          spreadY: 1.5,
        });
        if (rainDrop != null) {
          rainDrops.push(rainDrop);
        }
      }
    }
    return rainDrops;
  }

  clearDrops(): void {
    this.drops.forEach((drop) => {
      const id = window.setTimeout(() => {
        drop.shrink = 0.1 + random(0.5);
      }, random(1200));
      this.timeoutIDs.push(id);
    });
    this.clearTexture();
  }

  clearTexture(): void {
    this.textureCleaningIterations = 50;
  }

  updateDroplets(timeScale: number): void {
    if (this.textureCleaningIterations > 0) {
      this.textureCleaningIterations -= 1 * timeScale;
      this.dropletsCtx.globalCompositeOperation = "destination-out";
      this.dropletsCtx.fillStyle = "rgba(0,0,0," + 0.05 * timeScale + ")";
      this.dropletsCtx.fillRect(
        0,
        0,
        this.width * this.dropletsPixelDensity,
        this.height * this.dropletsPixelDensity
      );
    }
    if (this.options.raining) {
      this.dropletsCounter += this.options.dropletsRate * timeScale * this.areaMultiplier;
      times(this.dropletsCounter, () => {
        this.dropletsCounter--;
        this.drawDroplet(
          random(this.width / this.scale),
          random(this.height / this.scale),
          random(...this.options.dropletsSize, (n) => n * n)
        );
      });
    }
    this.ctx.drawImage(this.droplets, 0, 0, this.width, this.height);
  }

  updateDrops(timeScale: number): void {
    let newDrops: DropItem[] = [];

    this.updateDroplets(timeScale);
    const rainDrops = this.updateRain(timeScale);
    newDrops = newDrops.concat(rainDrops);

    this.drops.sort((a, b) => {
      const va = a.y * (this.width / this.scale) + a.x;
      const vb = b.y * (this.width / this.scale) + b.x;
      return va > vb ? 1 : va === vb ? 0 : -1;
    });

    this.drops.forEach((drop, i) => {
      if (!drop.killed) {
        if (
          chance(
            (drop.r - this.options.minR * this.options.dropFallMultiplier) *
              (0.1 / this.deltaR) *
              timeScale
          )
        ) {
          drop.momentum += random((drop.r / this.options.maxR) * 4);
        }
        if (this.options.autoShrink && drop.r <= this.options.minR && chance(0.05 * timeScale)) {
          drop.shrink += 0.01;
        }
        drop.r -= drop.shrink * timeScale;
        if (drop.r <= 0) drop.killed = true;

        if (this.options.raining) {
          drop.lastSpawn += drop.momentum * timeScale * this.options.trailRate;
          if (drop.lastSpawn > drop.nextSpawn) {
            const trailDrop = this.createDrop({
              x: drop.x + random(-drop.r, drop.r) * 0.1,
              y: drop.y - drop.r * 0.01,
              r: drop.r * random(...this.options.trailScaleRange),
              spreadY: drop.momentum * 0.1,
              parent: drop,
            });

            if (trailDrop != null) {
              newDrops.push(trailDrop);

              drop.r *= Math.pow(0.97, timeScale);
              drop.lastSpawn = 0;
              drop.nextSpawn =
                random(this.options.minR, this.options.maxR) -
                drop.momentum * 2 * this.options.trailRate +
                (this.options.maxR - drop.r);
            }
          }
        }

        drop.spreadX *= Math.pow(0.4, timeScale);
        drop.spreadY *= Math.pow(0.7, timeScale);

        const moved = drop.momentum > 0;
        if (moved && !drop.killed) {
          drop.y += drop.momentum * this.options.globalTimeScale;
          drop.x += drop.momentumX * this.options.globalTimeScale;
          if (drop.y > this.height / this.scale + drop.r) {
            drop.killed = true;
          }
        }

        const checkCollision = (moved || drop.isNew) && !drop.killed;
        drop.isNew = false;

        if (checkCollision) {
          this.drops.slice(i + 1, i + 70).forEach((drop2) => {
            if (
              drop !== drop2 &&
              drop.r > drop2.r &&
              drop.parent !== drop2 &&
              drop2.parent !== drop &&
              !drop2.killed
            ) {
              const dx = drop2.x - drop.x;
              const dy = drop2.y - drop.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (
                d <
                (drop.r + drop2.r) *
                  (this.options.collisionRadius +
                    drop.momentum * this.options.collisionRadiusIncrease * timeScale)
              ) {
                const a1 = Math.PI * (drop.r * drop.r);
                const a2 = Math.PI * (drop2.r * drop2.r);
                let targetR = Math.sqrt((a1 + a2 * 0.8) / Math.PI);
                if (targetR > this.options.maxR) {
                  targetR = this.options.maxR;
                }
                drop.r = targetR;
                drop.momentumX += dx * 0.1;
                drop.spreadX = 0;
                drop.spreadY = 0;
                drop2.killed = true;
                drop.momentum = Math.max(
                  drop2.momentum,
                  Math.min(
                    40,
                    drop.momentum +
                      targetR * this.options.collisionBoostMultiplier +
                      this.options.collisionBoost
                  )
                );
              }
            }
          });
        }

        drop.momentum -= Math.max(1, this.options.minR * 0.5 - drop.momentum) * 0.1 * timeScale;
        if (drop.momentum < 0) drop.momentum = 0;
        drop.momentumX *= Math.pow(0.7, timeScale);

        if (!drop.killed) {
          newDrops.push(drop);
          if (moved && this.options.dropletsRate > 0)
            this.clearDroplets(drop.x, drop.y, drop.r * this.options.dropletsCleaningRadiusMultiplier);
          this.drawDrop(this.ctx, drop);
        }
      }
    });

    this.drops = newDrops;
  }

  update(): void {
    if (this.destroyed) return;
    this.clearCanvas();

    const now = Date.now();
    if (this.lastRender == null) this.lastRender = now;
    const deltaT = now - this.lastRender;
    let timeScale = deltaT / ((1 / 60) * 1000);
    if (timeScale > 1.1) timeScale = 1.1;
    timeScale *= this.options.globalTimeScale;
    this.lastRender = now;

    this.updateDrops(timeScale);

    if (!this.destroyed) {
      this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }
  }
}
