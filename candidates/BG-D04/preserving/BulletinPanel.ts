/** Implements the preserving BG-D04 subscription-cleanup candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { createElement, forwardRef, useEffect, useImperativeHandle } from "react";

import {
  bulletinSource,
  type BulletinAction,
  type BulletinChannel,
  type BulletinPanelHandle,
} from "../../../evaluation/arm-visible/BG-D04/contract.ts";

/** Keeps panel output synchronized with exactly the currently selected source channel. */
export const BulletinPanel = forwardRef<BulletinPanelHandle>(function BulletinPanel(_, ref) {
  useSignals();
  const channel = useSignal<BulletinChannel>("harbor");
  const bulletin = useSignal("none");

  useEffect(() => {
    const subscribedChannel = channel.value;
    const unsubscribe = bulletinSource.subscribe(subscribedChannel, (value) => {
      bulletin.value = `${subscribedChannel}:${value}`;
    });
    // Cleanup is the behavior under test: an old channel must be unable to update
    // the selected panel after React replaces this Effect.
    return unsubscribe;
  }, [channel.value]);

  useImperativeHandle(ref, () => ({
    dispatch(action: BulletinAction): void {
      if (action.type === "publish") bulletinSource.publish(action.channel, action.value);
      if (action.type === "switch") {
        channel.value = action.channel;
        bulletin.value = "none";
      }
      if (action.type === "reset") {
        channel.value = "harbor";
        bulletin.value = "none";
      }
    },
  }), []);

  return createElement("section", { "data-fixture": "BG-D04" },
    createElement("output", { id: "selected-channel" }, channel.value),
    createElement("output", { id: "bulletin" }, bulletin.value),
  );
});
