/** Implements one immutable BG-H02 stargazing-guide preview candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useImperativeHandle } from "react";

import type { GuideId, GuideStatus, StargazingGuideHandle, StargazingGuideProps } from "../../../evaluation/arm-visible/BG-H02/contract.ts";
import { renderStargazingGuidePreview } from "../../../evaluation/arm-visible/BG-H02/render.ts";

/** Exposes the shared guide-preview contract through signals-backed state. */
export const StargazingGuidePreview = React.forwardRef<StargazingGuideHandle, Omit<StargazingGuideProps, "ref">>(function StargazingGuidePreview({ source }, ref) {
  useSignals();
  const selectedGuideId = useSignal<"none" | GuideId>("none");
  const status = useSignal<GuideStatus>("idle");
  const content = useSignal("none");
  const actionLog = useSignal<readonly string[]>(["mount"]);

  useImperativeHandle(ref, () => ({
    select(guideId, label) {
      selectedGuideId.value = guideId; status.value = "loading"; content.value = "none";
      actionLog.value = [...actionLog.value, label];
      return source.request(guideId, (result) => {
        // Each successful source completion publishes the value delivered by its
        // request callback without consulting any external schedule.
        content.value = result; status.value = "ready";
      });
    },
    reset() {
      selectedGuideId.value = "none"; status.value = "idle"; content.value = "none";
      actionLog.value = [...actionLog.value, "reset"];
    },
  }));
  return renderStargazingGuidePreview(selectedGuideId.value, status.value, content.value, actionLog.value);
});
