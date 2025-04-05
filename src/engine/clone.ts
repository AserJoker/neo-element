export const clone = <T>(raw: T): T => {
  if (typeof raw === "object" && raw) {
    if (Array.isArray(raw)) {
      const arr: any[] = [];
      arr.push(...raw.map(clone));
      return arr as T;
    } else {
      const res: Record<any, any> = {};
      Object.keys(raw).forEach(
        (key) => (res[key] = clone(raw[key as keyof T]))
      );
      return res;
    }
  } else {
    return raw;
  }
};
