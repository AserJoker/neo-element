export type ValueType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "tuple"
  | "record"
  | "union";
export interface IBaseValueType<T extends ValueType = ValueType> {
  type: T;
  optional?: true;
}

export interface IStringValueType extends IBaseValueType<"string"> {
  default?: string;
  range?: [number, number];
  validate?: string;
}

export interface INumberValueType extends IBaseValueType<"number"> {
  default?: number;
  min?: number;
  max?: number;
}

export interface IBooleanValueType extends IBaseValueType<"boolean"> {
  default?: boolean;
  min?: number;
  max?: number;
}

export interface IObjectValueType<
  Prop extends Record<string, IBaseValueType> = Record<string, IBaseValueType>,
> extends IBaseValueType<"object"> {
  properties: Prop;
}

export interface IArrayValueType<T extends IBaseValueType = IBaseValueType>
  extends IBaseValueType<"array"> {
  items: T;
}

export interface ITupleValueType<T extends IBaseValueType[] = []>
  extends IBaseValueType<"tuple"> {
  items: T;
}

export interface IRecordValueType<T extends IBaseValueType = IBaseValueType>
  extends IBaseValueType<"record"> {
  field: T;
}

export interface IUnionValueType<T extends IBaseValueType[] = []>
  extends IBaseValueType<"union"> {
  items: T;
}

export type IValueType =
  | IStringValueType
  | INumberValueType
  | IBooleanValueType
  | IObjectValueType
  | IArrayValueType
  | ITupleValueType
  | IRecordValueType
  | IUnionValueType;

export type IBaseComputedType<T> = T extends IStringValueType
  ? string
  : T extends INumberValueType
    ? number
    : T extends IBooleanValueType
      ? boolean
      : T extends IObjectValueType<infer Prop>
        ? Unpack<Prop>
        : T extends IArrayValueType<infer Item>
          ? IComputedType<Item>[]
          : T extends ITupleValueType<infer Item>
            ? Unpack<Item>
            : T extends IRecordValueType<infer F>
              ? Record<string, IComputedType<F>>
              : T extends IUnionValueType<infer Item>
                ? UnpackArr<Unpack<Item>>
                : never;

export type IComputedType<T> = T extends IBaseValueType
  ? T["optional"] extends true
    ? IBaseComputedType<T> | undefined
    : IBaseComputedType<T>
  : never;
type UnpackBase<T> = {
  [key in keyof T as T[key] extends IBaseValueType
    ? T[key]["optional"] extends true
      ? never
      : key
    : never]: IBaseComputedType<T[key]>;
};
type UnpackOptional<T> = {
  [key in keyof T as T[key] extends IBaseValueType
    ? T[key]["optional"] extends true
      ? key
      : never
    : never]?: IBaseComputedType<T[key]>;
};

export type Unpack<T> = UnpackBase<T> & UnpackOptional<T>;

type UnpackArr<T> = T extends Array<infer K> ? K : never;

export const defineString = <T extends IStringValueType>(type: T) => type;

export const defineNumber = <T extends INumberValueType>(type: T) => type;

export const defineBoolean = <T extends IBooleanValueType>(type: T) => type;

export const defineObject = <
  P extends Record<string, IValueType>,
  T extends IObjectValueType<P>,
>(
  type: T
) => type;
export const defineArray = <I extends IValueType, T extends IArrayValueType<I>>(
  type: T
) => type;

export const defineTuple = <
  I extends IBaseValueType[],
  T extends ITupleValueType<[...I]>,
>(
  type: T
) => type;

export const defineRecord = <
  F extends IBaseValueType,
  T extends IRecordValueType<F>,
>(
  type: T
) => type;

export const defineUnion = <
  U extends IBaseValueType[],
  T extends IUnionValueType<U>,
>(
  type: T
) => type;
