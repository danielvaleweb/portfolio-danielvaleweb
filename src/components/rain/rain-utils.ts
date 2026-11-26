export interface WeatherOptions {
  minR: number;
  maxR: number;
  rainChance: number;
  rainLimit: number;
  drizzle: number;
  drizzleSize: [number, number];
  raining: boolean;
  trailRate: number;
  trailScaleRange: [number, number];
  flashChance: number;
}

export const weatherData: Record<string, WeatherOptions> = {
  rain: {
    minR: 10,
    maxR: 40,
    rainChance: 0.35,
    rainLimit: 6,
    drizzle: 50,
    drizzleSize: [2, 4.5],
    raining: true,
    trailRate: 1,
    trailScaleRange: [0.2, 0.35],
    flashChance: 0,
  },
  storm: {
    minR: 15,
    maxR: 45,
    rainChance: 0.55,
    rainLimit: 6,
    drizzle: 80,
    drizzleSize: [2, 6],
    raining: true,
    trailRate: 1,
    trailScaleRange: [0.15, 0.3],
    flashChance: 0.1,
  },
  fallout: {
    minR: 15,
    maxR: 45,
    rainChance: 0.45,
    rainLimit: 6,
    drizzle: 20,
    drizzleSize: [2, 4.5],
    raining: true,
    trailRate: 4,
    trailScaleRange: [0.2, 0.35],
    flashChance: 0.6,
  },
  drizzle: {
    minR: 10,
    maxR: 40,
    rainChance: 0.15,
    rainLimit: 2,
    drizzle: 10,
    drizzleSize: [2, 4.5],
    raining: true,
    trailRate: 1,
    trailScaleRange: [0.2, 0.35],
    flashChance: 0,
  },
};
