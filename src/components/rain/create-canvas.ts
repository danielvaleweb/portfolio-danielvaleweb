export default function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === "undefined") {
    return null as unknown as HTMLCanvasElement;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}
