export const get = <T>(target: unknown, key: string) => {
  let tmp = target;
  const parts = key.replace("[", ".").replace("]", "").split(".");
  for (const part of parts) {
    if (typeof tmp === "object" && tmp) {
      tmp = Reflect.get(tmp, part);
    } else {
      return undefined;
    }
  }
  return tmp as T;
};
