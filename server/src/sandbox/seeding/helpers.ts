import { Document } from 'mongodb';

export function generate(n: number, factory: (i: number) => Document): Document[] {
  return Array.from({ length: n }, (_, i) => factory(i));
}

export function hashToUnitInterval(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function deterministicInt(seed: string, min: number, maxInclusive: number): number {
  const r = hashToUnitInterval(seed);
  return Math.floor(r * (maxInclusive - min + 1)) + min;
}

export function deterministicMoney(seed: string, max: number): number {
  const r = hashToUnitInterval(seed);
  return Math.round(r * max * 100) / 100;
}

export function deterministicToken(seed: string): string {
  const hex = Math.floor(hashToUnitInterval(seed) * 0xffffffff)
    .toString(16)
    .padStart(8, '0');
  return `tok_${hex}`;
}
