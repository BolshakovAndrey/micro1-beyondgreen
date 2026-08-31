/**
 * Mirrors the public D02 identifiers inside the verifier capability. An
 * outside-isolation parity test proves equality with the arm-visible contract.
 */

/** Canonical D02 lane identifiers reproduced from the frozen public contract. */
export const D02_LANE_IDS = Object.freeze(
  Array.from({ length: 6 }, (_, index) => `PCL-${String(index + 1).padStart(2, "0")}`),
);

/** Select the one-based even D02 identifiers in canonical order. */
export function d02EvenLaneIds(): readonly string[] {
  return D02_LANE_IDS.filter((_, index) => (index + 1) % 2 === 0);
}
