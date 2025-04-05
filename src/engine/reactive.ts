export const reactive = <T>(target: T, cb: (key: string) => void): T => {
  if (typeof target === "object" && target) {
    return new Proxy(target, {
      get(target, p) {
        const val = Reflect.get(target, p);
        if (typeof p === "string") {
          const result = reactive(val, (field) =>
            cb(`${p}${field ? `.${field}` : ""}`)
          );
          if (
            result === Array.prototype.push ||
            result === Array.prototype.pop ||
            result === Array.prototype.shift ||
            result === Array.prototype.unshift ||
            result === Array.prototype.splice
          ) {
            return function (this: any, ...args: any[]) {
              const res = Reflect.apply(result as Function, this, args);
              if (this === target) {
                cb("");
              }
              return res;
            };
          }
          return result;
        }
        return val;
      },
      set(target, p, val) {
        const result = Reflect.set(target, p, val);
        if (typeof p === "string") {
          cb(p);
        }
        return result;
      },
    });
  } else {
    return target;
  }
};
