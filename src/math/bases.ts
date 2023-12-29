import type { Add, DivMod, Multiply } from "./arithmetic";
import type { Binary, Pad } from "./util";

export type ToBase<
  TNum extends Binary,
  TBase extends Binary,
  TDigits extends Binary[] = []
> = TNum extends 0[]
  ? TDigits
  : DivMod<TNum, TBase> extends [
      infer Quotient extends Binary,
      infer Remainder extends Binary
    ]
  ? ToBase<Quotient, TBase, [...TDigits, Remainder]>
  : never;

export type FromBase<
  TDigits extends Binary[],
  TBase extends Binary,
  TNum extends Binary = Pad<[]>
> = TDigits extends [
  infer Digit extends Binary,
  ...infer Digits extends Binary[]
]
  ? FromBase<Digits, TBase, Add<Multiply<TNum, TBase>, Digit>>
  : TNum;
