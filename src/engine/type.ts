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
  Prop extends Record<string, IBaseValueType> = {}
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

export type IComputedType<T> = T extends IStringValueType
  ? T["optional"] extends true
    ? string | undefined
    : string
  : T extends INumberValueType
  ? T["optional"] extends true
    ? number | undefined
    : number
  : T extends IBooleanValueType
  ? T["optional"] extends true
    ? boolean | undefined
    : boolean
  : T extends IObjectValueType<infer Prop>
  ? T["optional"] extends true
    ? Unpack<Prop> | undefined
    : Unpack<Prop>
  : T extends IArrayValueType<infer Item>
  ? T["optional"] extends true
    ? IComputedType<Item>[] | undefined
    : IComputedType<Item>[]
  : T extends ITupleValueType<infer Item>
  ? T["optional"] extends true
    ? Unpack<Item> | undefined
    : Unpack<Item>
  : T extends IRecordValueType<infer F>
  ? T["optional"] extends true
    ? Record<string, IComputedType<F>> | undefined
    : Record<string, IComputedType<F>>
  : T extends IUnionValueType<infer Item>
  ? T["optional"] extends true
    ? UnpackArr<Unpack<Item>> | undefined
    : UnpackArr<Unpack<Item>>
  : never;

type Unpack<T> = {
  [key in keyof T]: IComputedType<T[key]>;
};
type UnpackArr<T> = T extends Array<infer K> ? K : never;

export const defineString = <T extends IStringValueType>(type: T) => type;

export const defineNumber = <T extends INumberValueType>(type: T) => type;

export const defineBoolean = <T extends IBooleanValueType>(type: T) => type;

export const defineObject = <
  P extends Record<string, IValueType>,
  T extends IObjectValueType<P>
>(
  type: T
) => type;
export const defineArray = <I extends IValueType, T extends IArrayValueType<I>>(
  type: T
) => type;

export const defineTuple = <
  I extends IBaseValueType[],
  T extends ITupleValueType<[...I]>
>(
  type: T
) => type;

export const defineRecord = <
  F extends IBaseValueType,
  T extends IRecordValueType<F>
>(
  type: T
) => type;

export const defineUnion = <
  U extends IBaseValueType[],
  T extends IUnionValueType<U>
>(
  type: T
) => type;
