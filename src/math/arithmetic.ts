import type { Binary, Bit, Pad } from "./util";

export type Add<
  A extends Binary,
  B extends Binary,
  Carry extends Bit = 0,
  Result extends Binary = []
> = A extends [...infer A extends Binary, infer BitA extends Bit]
  ? B extends [...infer B extends Binary, infer BitB extends Bit]
    ? 1 | 0 extends BitA | BitB // one of BitA or BitB is 1, and the other is 0
      ? Add<A, B, Carry, [Carry extends 1 ? 0 : 1, ...Result]>
      : Add<A, B, BitA, [Carry, ...Result]> // BitA and BitB are either both 1 or both 0
    : never // A and B will never have different lengths
  : Result;

export type Subtract<
  A extends Binary,
  B extends Binary,
  Borrow extends Bit = 0,
  Result extends Binary = []
> = A extends [...infer A extends Binary, infer BitA extends Bit]
  ? B extends [...infer B extends Binary, infer BitB extends Bit]
    ? [BitA, BitB, Borrow] extends [1, 0, 0]
      ? Subtract<A, B, 0, [1, ...Result]>
      : [BitA, BitB, Borrow] extends [0, 0, 0] | [1, 1, 0] | [1, 0, 1]
      ? Subtract<A, B, 0, [0, ...Result]>
      : [BitA, BitB, Borrow] extends [0, 1, 0] | [1, 1, 1] | [0, 0, 1]
      ? Subtract<A, B, 1, [1, ...Result]>
      : Subtract<A, B, 1, [0, ...Result]>
    : never
  : Result;

/** A > B -> 1, A <= B -> 0 */
export type Compare<A extends Binary, B extends Binary> = A extends [
  infer BitA extends Bit,
  ...infer A extends Binary
]
  ? B extends [infer BitB extends Bit, ...infer B extends Binary]
    ? [BitA, BitB] extends [1, 0]
      ? 1
      : [BitA, BitB] extends [0, 1]
      ? 0
      : Compare<A, B>
    : never
  : 0;

export type Multiply<
  A extends Binary,
  B extends Binary,
  Result extends Binary = Pad<[]>
> = B extends 0[] ? Result : Multiply<A, Subtract<B, Pad<[1]>>, Add<Result, A>>;

export type DivMod<
  Numerator extends Binary,
  Denominator extends Binary,
  Division extends Binary = Pad<[]>
> = Compare<Numerator, Denominator> extends 0
  ? [Division, Numerator]
  : DivMod<
      Subtract<Numerator, Denominator>,
      Denominator,
      Add<Division, Pad<[1]>>
    >;

export type Exponentiate<
  Base extends Binary,
  Power extends Binary,
  Result extends Binary = Pad<[]>
> = Power extends 0[]
  ? Result
  : Exponentiate<Base, Subtract<Power, Pad<[1]>>, Multiply<Result, Base>>;
