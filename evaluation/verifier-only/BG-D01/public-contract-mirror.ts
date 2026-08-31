/**
 * Mirrors the public D01 identifiers inside the verifier capability. An
 * outside-isolation parity test proves equality with the arm-visible contract.
 */

/** Canonical D01 card identifiers reproduced from the frozen public contract. */
export const D01_CARD_IDS = Object.freeze(
  Array.from({ length: 300 }, (_, index) => `MVG-${String(index + 1).padStart(3, "0")}`),
);

/** Select the one-based every-third D01 identifiers in canonical order. */
export function d01EveryThirdCardIds(): readonly string[] {
  return D01_CARD_IDS.filter((_, index) => (index + 1) % 3 === 0);
}
