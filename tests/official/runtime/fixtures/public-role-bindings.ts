export const SyntheticCandidate = Object.freeze({ id: "synthetic-candidate" });

export async function mountSyntheticCandidate() {
  let value = 0;
  return {
    observe: () => Object.freeze({ value }),
    async dispatch(action: Readonly<{ amount?: number }>) {
      value += action.amount ?? 0;
      return Object.freeze({ value });
    },
    async dispose() { return Object.freeze({ value, disposed: true }); },
  };
}
