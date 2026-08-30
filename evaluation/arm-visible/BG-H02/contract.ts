/** Defines the complete arm-visible BG-H02 stargazing preview contract. */
import type { ComponentType, Ref } from "react";

/** Enumerates selectable synthetic guide identities. */
export type GuideId = "GUIDE-MOON" | "GUIDE-METEOR" | "GUIDE-COMET";

/** Enumerates public preview states. */
export type GuideStatus = "idle" | "loading" | "ready";

/** Identifies one deterministic deferred request without exposing completion internals. */
export type RequestHandle = Readonly<{ requestId: string; guideId: GuideId }>;

/** Defines the deterministic source capability injected into each candidate. */
export type DeferredGuideSource = Readonly<{
  request(guideId: GuideId, onComplete: (content: string) => void): RequestHandle;
}>;

/** Captures every arm-visible observable at a settled boundary. */
export type GuidePreviewObservation = Readonly<{
  selectedGuideId: "none" | GuideId;
  status: GuideStatus;
  content: string;
  actionLog: readonly string[];
  createdRequestIds: readonly string[];
}>;

/** Defines the imperative user-action surface exposed by a candidate. */
export type StargazingGuideHandle = Readonly<{
  select(guideId: GuideId, label: string): RequestHandle;
  reset(): void;
}>;

/** Describes candidate props shared by the public harness. */
export type StargazingGuideProps = Readonly<{ source: DeferredGuideSource; ref?: Ref<StargazingGuideHandle> }>;

/** Describes a React candidate mountable by the public harness. */
export type StargazingGuideComponent = ComponentType<StargazingGuideProps>;

/** Describes the public latest-selection-wins invariant. */
export type ArmVisibleInvariantContract = Readonly<{
  id: "BG-H02-INV-CURRENT-EPOCH";
  riskCategories: readonly ["ordering", "lifecycle"];
  probeId: "BG-H02-PROBE-REVERSE-COMPLETION";
  description: string;
}>;

/** Does not reveal which neutral candidate contains the missing epoch guard. */
export const ARM_VISIBLE_INVARIANTS: readonly ArmVisibleInvariantContract[] = Object.freeze([{
  id: "BG-H02-INV-CURRENT-EPOCH",
  riskCategories: ["ordering", "lifecycle"],
  probeId: "BG-H02-PROBE-REVERSE-COMPLETION",
  description: "Only completion from the current logical request epoch may change the preview.",
}]);

/** Maps guide identity to deterministic synthetic content without network access. */
export function guideContent(guideId: GuideId): string {
  switch (guideId) {
    case "GUIDE-MOON": return "Moon craters";
    case "GUIDE-METEOR": return "Meteor paths";
    case "GUIDE-COMET": return "Comet tails";
  }
}
