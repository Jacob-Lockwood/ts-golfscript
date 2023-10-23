// ~~ Util ~~

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ASCII = [
  "\u0000",
  "\u0001",
  "\u0002",
  "\u0003",
  "\u0004",
  "\u0005",
  "\u0006",
  "\u0007",
  "\b",
  "\t",
  "\n",
  "\u000b",
  "\f",
  "\r",
  "\u000e",
  "\u000f",
  "\u0010",
  "\u0011",
  "\u0012",
  "\u0013",
  "\u0014",
  "\u0015",
  "\u0016",
  "\u0017",
  "\u0018",
  "\u0019",
  "\u001a",
  "\u001b",
  "\u001c",
  "\u001d",
  "\u001e",
  "\u001f",
  " ",
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "{",
  "|",
  "}",
  "~"
];
type WordChar =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "_";

type IndexOf<Item, List extends any[], Index extends 1[] = []> = List extends [
  Item,
  ...any
]
  ? Index["length"]
  : List extends [any, ...infer R extends any[]]
  ? IndexOf<Item, R, [...Index, 1]>
  : -1;

// ~~ Golfscript ~~

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

type GS<
  Code extends string,
  Stack extends any[] = [],
  Vars extends Record<string, any> = {}
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

/*

I think I've finished the bulk of the work. Now I just have to implement the built-ins, which
might be kind of tricky. I think I'm going to drop support for bitwise operations for now but
I might want to reconsider that at some point by working on binary digit lists instead of
base-10; after all, I am going to have to implement base conversion anyway... I'll have to
think about this a bit more. It might make implementation a bit harder since binary is 
obviously a lot less intuitive than base-10 to a human like me so I might struggle getting it
to work right. Fingers crossed.

I also have to figure out that bug with arrays I was running into before

*/

type BuiltIns = {};
