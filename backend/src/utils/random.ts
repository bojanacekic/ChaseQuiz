/** Returns true with given probability (0-1) */
export function randomBool(probability: number): boolean {
  return Math.random() < probability
}

/** Returns a random integer in [min, max] inclusive */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
