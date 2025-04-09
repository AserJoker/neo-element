export const set = (object: unknown, key: string, value: unknown) => {
  let paths = key.replace("[", ".").replace("]", "").split(".");
  const field = paths[paths.length - 1];
  paths = paths.slice(0, paths.length - 1);
  let tmp = object;
  for (const part of paths) {
    if (typeof tmp === "object" && tmp) {
      tmp = Reflect.get(tmp, part);
    } else {
      return false;
    }
  }
  if (typeof tmp === "object" && tmp) {
    return Reflect.set(tmp, field, value);
  }
  return false;
};
