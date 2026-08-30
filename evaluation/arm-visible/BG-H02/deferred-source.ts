/** Implements the fixture-owned deterministic deferred source with no clocks or network. */
import { guideContent, type DeferredGuideSource, type GuideId, type RequestHandle } from "./contract.ts";

type Pending = Readonly<{ handle: RequestHandle; complete(content: string): void }>;

/** Controls explicit completion order while exposing only request capability to candidates. */
export class ControlledDeferredGuideSource {
  readonly #pending = new Map<string, Pending>();
  readonly #created: RequestHandle[] = [];

  /** Returns the narrow request capability injected into a candidate. */
  capability(): DeferredGuideSource {
    return Object.freeze({ request: (guideId, onComplete) => this.request(guideId, onComplete) });
  }

  /** Creates exactly one pending handle for a candidate selection. */
  request(guideId: GuideId, onComplete: (content: string) => void): RequestHandle {
    const handle = Object.freeze({ requestId: `R${this.#created.length + 1}`, guideId });
    this.#created.push(handle);
    this.#pending.set(handle.requestId, Object.freeze({ handle, complete: onComplete }));
    return handle;
  }

  /** Completes a pending handle once using its frozen synthetic content. */
  complete(handle: RequestHandle): void {
    const pending = this.#pending.get(handle.requestId);
    if (!pending || pending.handle.guideId !== handle.guideId) throw new RangeError("Request handle is not pending.");
    this.#pending.delete(handle.requestId);
    pending.complete(guideContent(handle.guideId));
  }

  /** Returns request identifiers in their deterministic creation order. */
  createdRequestIds(): readonly string[] { return Object.freeze(this.#created.map((handle) => handle.requestId)); }
}
