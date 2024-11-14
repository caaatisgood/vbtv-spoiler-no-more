export const log = (...args: any[]) => {
  if (!__DEBUG__) {
    return;
  }
  console.log("[[[vbtv-spoiler-no-more]]]", ...args)
}
