export const log = (...args) => {
  if (!__DEBUG__) {
    return;
  }
  console.log("[[[vbtv-spoiler-no-more]]]", ...args)
}
