/** Defines the complete arm-visible BG-H01 display-card editor contract. */
import type { ComponentType, Ref } from "react";

/** Enumerates the synthetic themes accepted by the fixture. */
export type CardTheme = "blue" | "amber" | "green";

/** Captures immutable parent inputs for one logical card identity. */
export type CardProps = Readonly<{
  cardId: string;
  initialTitle: string;
  initialTheme: CardTheme;
}>;

/** Adds a deterministic parent-transition label and revision to card inputs. */
export type DisplayCardEditorProps = CardProps & Readonly<{
  revision: number;
  transitionLabel: string;
  ref?: Ref<DisplayCardEditorHandle>;
}>;

/** Enumerates user actions exposed by the candidate handle. */
export type EditorAction =
  | { type: "edit-title"; value: string }
  | { type: "edit-theme"; value: CardTheme }
  | { type: "reset-current" };

/** Captures every arm-visible observable at a settled render boundary. */
export type DisplayCardObservation = Readonly<{
  cardId: string;
  title: string;
  theme: CardTheme;
  dirty: boolean;
  actionLog: readonly string[];
}>;

/** Defines the imperative action surface shared by both candidates. */
export type DisplayCardEditorHandle = Readonly<{ dispatch(action: EditorAction): void }>;

/** Describes a React candidate mountable by the shared harness. */
export type DisplayCardEditorComponent = ComponentType<DisplayCardEditorProps>;

/** Describes the public invariant available to oracle-free risk probes. */
export type ArmVisibleInvariantContract = Readonly<{
  id: "BG-H01-INV-PROP-RESET";
  riskCategories: readonly ["identity", "lifecycle"];
  probeId: "BG-H01-PROBE-CARD-IDENTITY-CHANGE";
  description: string;
}>;

/** Does not disclose which neutral candidate contains the seeded defect. */
export const ARM_VISIBLE_INVARIANTS: readonly ArmVisibleInvariantContract[] = Object.freeze([{
  id: "BG-H01-INV-PROP-RESET",
  riskCategories: ["identity", "lifecycle"],
  probeId: "BG-H01-PROBE-CARD-IDENTITY-CHANGE",
  description: "A new cardId replaces both draft fields and clears dirty state at the settled boundary.",
}]);

/** Rejects invalid parent inputs before a candidate can mutate observable state. */
export function assertCardProps(props: CardProps): void {
  if (props.cardId.trim().length === 0) throw new RangeError("Card identity must be non-empty.");
  if (props.initialTitle.trim().length === 0) throw new RangeError("Initial title must be non-empty.");
  if (!(["blue", "amber", "green"] as const).includes(props.initialTheme)) throw new RangeError("Initial theme is invalid.");
}

/** Returns whether the current draft differs from the current identity inputs. */
export function isDirty(title: string, theme: CardTheme, initial: CardProps): boolean {
  return title !== initial.initialTitle || theme !== initial.initialTheme;
}
