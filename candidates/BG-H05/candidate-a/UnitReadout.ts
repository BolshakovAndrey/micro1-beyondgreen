/** Implements one neutral BG-H05 unit-readout candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useEffect, useImperativeHandle } from "react";

import type { UnitReadoutHandle, UnitReadoutProps } from "../../../evaluation/arm-visible/BG-H05/contract.ts";
import { renderUnitReadout } from "../../../evaluation/arm-visible/BG-H05/render.ts";

/** Exposes the frozen readout behavior through the shared arm-visible surface. */
export const UnitReadout = React.forwardRef<UnitReadoutHandle, Omit<UnitReadoutProps, "ref">>(function UnitReadout({ consumerId, store }, ref) {
  useSignals();
  const snapshot = useSignal(store.getSnapshot());
  useEffect(() => store.subscribe(consumerId, (next) => { snapshot.value = next; }), [consumerId, store]);
  useImperativeHandle(ref, () => ({ toolbarWrite(unit) { store.write(unit); } }), [store]);
  return renderUnitReadout(consumerId, snapshot.value);
});
