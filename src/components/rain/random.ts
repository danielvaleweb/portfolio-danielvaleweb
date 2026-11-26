export function random(
  from: number | null = null,
  to: number | null = null,
  interpolation: ((n: number) => number) | null = null
): number {
  let f = from;
  let t = to;
  if (f == null) {
    f = 0;
    t = 1;
  } else if (f != null && t == null) {
    t = f;
    f = 0;
  }
  const delta = (t as number) - (f as number);

  if (interpolation == null) {
    interpolation = (n: number) => n;
  }
  return (f as number) + interpolation(Math.random()) * delta;
}

export function chance(c: number): boolean {
  return random() <= c;
}
