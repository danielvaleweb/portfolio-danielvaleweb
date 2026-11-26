interface ImageItem {
  name: string;
  src: any;
  img?: HTMLImageElement;
}

function loadImage(
  src: ImageItem | string,
  i: number,
  onLoad?: (img: HTMLImageElement, i: number) => void
): Promise<{ name: string; img: HTMLImageElement; src: any }> {
  return new Promise((resolve) => {
    const item: ImageItem = typeof src === "string" ? { name: "image" + i, src } : src;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => {
      if (typeof onLoad === "function") {
        onLoad(img, i);
      }
      resolve({ name: item.name, img, src: item.src });
    });
    img.addEventListener("error", () => {
      console.warn("Weather effect: texture load error", item.src);
      resolve({ name: item.name, img, src: item.src });
    });
    const url = typeof item.src === "string" ? item.src : item.src?.src || item.src?.default || item.src;
    img.src = url;
  });
}

function loadImages(
  images: Array<ImageItem | string>,
  onLoad?: (img: HTMLImageElement, i: number) => void
): Promise<Array<{ name: string; img: HTMLImageElement; src: any }>> {
  return Promise.all(images.map((src, i) => loadImage(src, i, onLoad)));
}

export default function ImageLoader(
  images: Array<ImageItem | string>,
  onLoad?: (img: HTMLImageElement, i: number) => void
): Promise<Record<string, { img: HTMLImageElement; src: any }>> {
  return new Promise((resolve) => {
    loadImages(images, onLoad).then((loadedImages) => {
      const r: Record<string, { img: HTMLImageElement; src: any }> = {};
      loadedImages.forEach((curImage) => {
        r[curImage.name] = {
          img: curImage.img,
          src: curImage.src,
        };
      });
      resolve(r);
    });
  });
}
