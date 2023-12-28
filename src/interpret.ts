import type { BuiltIns } from "./builtins";

// Num is the list of digits, NumStr is kept in case the number is actually a variable.
type ParseNum<
  Code extends string,
  Num extends Digit[] = [],
  NumStr extends string = ""
> = Code extends `${infer Char extends Digit}${infer Rest}`
  ? ParseNum<Rest, [...Num, Char], `${NumStr}${Char}`>
  : [Num, NumStr, Code];

type ParseString<
  Code extends string,
  Str extends (keyof ASCII)[] = []
> = Code extends `"${infer Rest}`
  ? [Str, Rest]
  : Code extends `\\"${infer Rest}`
  ? ParseString<Rest, [...Str, IndexOf<'"', ASCII>]> // can be inlined as 34 if this ends up hurting performance
  : Code extends `${infer Char}${infer Rest}`
  ? Char extends `\\`
    ? ParseString<Rest, Str>
    : ParseString<Rest, [...Str, IndexOf<Char, ASCII>]>
  : "ERROR: unterminated string";

// this can be implemented more cleanly but i can't be asked at the moment
type ParseBlock<
  Code extends string,
  Body extends string = "",
  Depth extends 1[] = [1],
  InString extends 0 | 1 = 0
> = Depth extends []
  ? [Body, Code]
  : Code extends `${infer Char}${infer Rest}`
  ? Char extends '"'
    ? ParseBlock<Rest, `${Body}"`, Depth, InString extends 1 ? 0 : 1>
    : InString extends 1
    ? ParseBlock<Rest, `${Body}${Char}`, Depth, 1>
    : Char extends "{"
    ? ParseBlock<Rest, `${Body}{`, [...Depth, 1]>
    : [Char, Depth] extends ["}", [1, ...infer NewDepth extends 1[]]]
    ? ParseBlock<Rest, NewDepth extends 0 ? Body : `${Body}}`, NewDepth>
    : ParseBlock<Rest, `${Body}${Char}`, Depth>
  : "ERROR: unterminated block";

type ParseName<
  Code extends string,
  Name extends string = ""
> = Code extends `${infer Char}${infer Rest}`
  ? Char extends WordChar
    ? ParseName<Rest, `${Name}${Char}`>
    : Name extends ""
    ? [Char, Rest]
    : [Name, Code]
  : [Name, Code];

export type GS<
  Code extends string,
  Stack extends any[] = [],
  Vars extends Record<string, any> = BuiltIns
> = Code extends `${Digit}${any}`
  ? ParseNum<Code> extends [infer Num, infer NumStr, infer Rest extends string]
    ? GS<Rest, [...Stack, NumStr extends keyof Vars ? Vars[NumStr] : Num], Vars>
    : never
  : Code extends `"${infer Rest}`
  ? ParseString<Rest> extends [infer Str, infer Rest extends string]
    ? GS<Rest, [...Stack, Str], Vars>
    : ParseString<Rest>
  : Code extends `{${infer Rest}`
  ? ParseBlock<Rest> extends [
      infer Body extends string,
      infer Rest extends string
    ]
    ? GS<Rest, [...Stack, Evaler<Body>]>
    : ParseBlock<Rest>
  : [Code, Stack] extends [`:${infer Rest}`, [...any, infer Top]]
  ? ParseName<Rest> extends [
      infer Name extends string,
      infer Rest extends string
    ]
    ? GS<Rest, Stack, Vars & Record<Name, Top>>
    : never
  : ParseName<Code> extends [
      infer Name extends string,
      infer Rest extends string
    ]
  ? GS<
      Rest,
      Name extends keyof Vars
        ? Vars[Name] extends { fn: true }
          ? (Vars[Name] & Stack)["o"]
          : [...Stack, Vars[Name]]
        : Stack
    >
  : Stack;

interface Evaler<Block extends string> {
  fn: true;
  o: this extends [
    infer Stack extends any[],
    infer Vars extends Record<string, any>
  ]
    ? GS<Block, Stack, Vars>
    : never;
}
