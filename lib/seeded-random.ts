/**
 * Deterministic pseudo-random generator based on a seed.
 * Produces the same output on server and client for the same seed,
 * preventing React hydration mismatches when used in SSR.
 *
 * Uses the classic sin-based hash function (GLSL-style).
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generate deterministic positions/sizes for an array of items.
 * Pure function: same input → same output, no side effects.
 */
export function generateCircleParams(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    cx: seededRandom(i * 1.1) * 400,
    cy: seededRandom(i * 2.3 + 17) * 400,
    r: seededRandom(i * 3.7 + 31) * 2 + 1,
    dur: seededRandom(i * 4.1 + 53) * 3 + 2
  }));
}