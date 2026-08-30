/** Defines the arm-visible subscription panel contract without ground-truth labels. */

/** Enumerates the two synthetic channels available to the fixture. */
export type BulletinChannel = "harbor" | "orchard";

/** Describes the actions a harness may dispatch to a candidate panel. */
export type BulletinAction =
  | { type: "switch"; channel: BulletinChannel }
  | { type: "publish"; channel: BulletinChannel; value: number }
  | { type: "reset" };

/** Captures the public panel output and synthetic source membership after settlement. */
export type BulletinObservation = Readonly<{
  selectedChannel: BulletinChannel;
  bulletin: string;
  subscribers: Readonly<Record<BulletinChannel, number>>;
}>;

/** Defines the imperative surface exposed by each candidate component. */
export type BulletinPanelHandle = Readonly<{
  dispatch(action: BulletinAction): void;
}>;

/** Defines a subscription callback for the synthetic source. */
export type BulletinListener = (value: number) => void;

/** Implements the deterministic external source both candidates must synchronize with. */
export class SyntheticBulletinSource {
  private readonly listeners = new Map<BulletinChannel, Set<BulletinListener>>([
    ["harbor", new Set<BulletinListener>()],
    ["orchard", new Set<BulletinListener>()],
  ]);

  /** Registers one listener and returns an idempotent cleanup operation. */
  subscribe(channel: BulletinChannel, listener: BulletinListener): () => void {
    const channelListeners = this.listeners.get(channel);
    if (!channelListeners) throw new Error(`Unknown bulletin channel: ${channel}`);
    channelListeners.add(listener);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      channelListeners.delete(listener);
    };
  }

  /** Delivers a synthetic bulletin synchronously to current channel subscribers only. */
  publish(channel: BulletinChannel, value: number): void {
    if (!Number.isInteger(value) || value < 0) throw new RangeError("Bulletin value must be a non-negative integer.");
    for (const listener of this.listeners.get(channel) ?? []) listener(value);
  }

  /** Returns immutable per-channel subscriber counts for public lifecycle observations. */
  counts(): Readonly<Record<BulletinChannel, number>> {
    return Object.freeze({
      harbor: this.listeners.get("harbor")?.size ?? 0,
      orchard: this.listeners.get("orchard")?.size ?? 0,
    });
  }

  /** Clears fixture state between isolated mounts; candidate lifecycle behavior is checked before this reset. */
  resetForFixture(): void {
    this.listeners.get("harbor")?.clear();
    this.listeners.get("orchard")?.clear();
  }
}

/** Provides the one deterministic source instance used by the public test harness. */
export const bulletinSource = new SyntheticBulletinSource();
