export const log = (...args) => {
  if (!__DEBUG__) {
    return;
  }
  console.log("[[[vbtv-done-right]]]", ...args)
}
