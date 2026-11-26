import React, { useEffect, useRef } from "react";
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import loadImages from "./image-loader";
import createCanvas from "./create-canvas";
import { weatherData } from "./rain-utils";

import DropColor from "./img/drop-color.png";
import DropAlpha from "./img/drop-alpha.png";
import DefaultBg from "./img/rain-bg.jpg";

interface RainEffectProps {
  type?: "rain" | "storm" | "drizzle" | "fallout";
  backgroundImageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function RainEffect({
  type = "rain",
  backgroundImageUrl = DefaultBg,
  className = "",
  style = {},
}: RainEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isCancelled = false;
    let raindrops: Raindrops | null = null;
    let renderer: RainRenderer | null = null;
    let intervalId: number | undefined = undefined;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpi = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const width = Math.max(300, rect.width || container.clientWidth || 800);
    const height = Math.max(200, rect.height || container.clientHeight || 400);

    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = backgroundImageUrl;

    const texturesPromise = loadImages([
      { name: "dropAlpha", src: DropAlpha },
      { name: "dropColor", src: DropColor },
    ]);

    const bgPromise = new Promise<HTMLImageElement>((resolve) => {
      if (bgImage.complete && bgImage.naturalWidth > 0) {
        resolve(bgImage);
      } else {
        bgImage.addEventListener("load", () => resolve(bgImage), { once: true });
        bgImage.addEventListener("error", () => resolve(bgImage), { once: true });
      }
    });

    Promise.all([texturesPromise, bgPromise]).then(([images, loadedBg]) => {
      if (isCancelled || !canvasRef.current) return;

      const dropColor = images.dropColor?.img;
      const dropAlpha = images.dropAlpha?.img;
      if (!dropColor || !dropAlpha) return;

      raindrops = new Raindrops(
        canvas.width,
        canvas.height,
        dpi,
        dropAlpha,
        dropColor,
        {
          trailRate: 1,
          trailScaleRange: [0.2, 0.45],
          collisionRadius: 0.45,
          dropletsCleaningRadiusMultiplier: 0.28,
          ...weatherData[type],
        }
      );

      const bgW = loadedBg.naturalWidth || width;
      const bgH = loadedBg.naturalHeight || height;

      const textureFg = createCanvas(bgW, bgH);
      const textureFgCtx = textureFg.getContext("2d");
      const textureBg = createCanvas(bgW, bgH);
      const textureBgCtx = textureBg.getContext("2d");

      if (textureFgCtx && loadedBg.complete && loadedBg.naturalWidth > 0) {
        textureFgCtx.drawImage(loadedBg, 0, 0, bgW, bgH);
      }
      if (textureBgCtx && loadedBg.complete && loadedBg.naturalWidth > 0) {
        textureBgCtx.drawImage(loadedBg, 0, 0, bgW, bgH);
      }

      renderer = new RainRenderer(
        canvas,
        raindrops.canvas,
        textureFg,
        textureBg,
        null,
        {
          brightness: 1.04,
          alphaMultiply: 16,
          alphaSubtract: 4,
          minRefraction: 128,
        }
      );

      if (type === "storm" || type === "fallout") {
        const curWeatherData = weatherData[type];
        const minInterval = 1000;
        const maxInterval = 5000;
        const flashChance = curWeatherData?.flashChance || 0;
        const interval = minInterval + (maxInterval - minInterval) * (1 - flashChance);

        intervalId = window.setInterval(() => {
          if (isCancelled || !renderer || !renderer.gl) return;
          const flicker = Math.random() * 2.0;
          renderer.gl.useProgram(renderer.programWater!);
          renderer.gl.createUniform("1f", "lightningFlash", flicker);
          setTimeout(() => {
            if (isCancelled || !renderer || !renderer.gl) return;
            renderer.gl.useProgram(renderer.programWater!);
            renderer.gl.createUniform("1f", "lightningFlash", 0.0);
          }, 100 + Math.random() * 200);
        }, interval);
      }
    });

    return () => {
      isCancelled = true;
      if (intervalId != null) clearInterval(intervalId);
      if (raindrops) raindrops.destroy();
      if (renderer) renderer.destroy();
    };
  }, [type, backgroundImageUrl]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}
