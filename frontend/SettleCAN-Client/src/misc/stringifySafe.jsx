export function stringifySafe(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        // Duplicate reference found, skip it
        return;
      }
      seen.add(value);
    }
    return value;
  });
}