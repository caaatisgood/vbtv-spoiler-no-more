const DEBUG = true

export const log = (...args) => {
  if (!DEBUG) {
    return
  }
  console.log("[[[vbtv-done-right]]]", ...args)
}
