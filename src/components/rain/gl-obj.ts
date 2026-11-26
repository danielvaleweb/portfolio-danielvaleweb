import * as WebGL from "./webgl";

export default class GL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  width: number = 0;
  height: number = 0;

  constructor(canvas: HTMLCanvasElement, options: WebGLContextAttributes, vert: string, frag: string) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.gl = WebGL.getContext(canvas, options);
    if (this.gl) {
      this.program = this.createProgram(vert, frag);
      if (this.program) {
        this.useProgram(this.program);
      }
    }
  }

  createProgram(vert: string, frag: string) {
    if (!this.gl) return null;
    return WebGL.createProgram(this.gl, vert, frag);
  }

  useProgram(program: WebGLProgram) {
    this.program = program;
    if (this.gl) {
      this.gl.useProgram(program);
    }
  }

  createTexture(source: any, i: number) {
    if (!this.gl) return null;
    return WebGL.createTexture(this.gl, source, i);
  }

  createUniform(type: string, name: string, ...v: any[]) {
    if (!this.gl || !this.program) return;
    WebGL.createUniform(this.gl, this.program, type, name, ...v);
  }

  activeTexture(i: number) {
    if (!this.gl) return;
    WebGL.activeTexture(this.gl, i);
  }

  updateTexture(source: any) {
    if (!this.gl) return;
    WebGL.updateTexture(this.gl, source);
  }

  draw() {
    if (!this.gl) return;
    WebGL.setRectangle(this.gl, -1, -1, 2, 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}
