export type Bit = 0 | 1;
export type Binary = Bit[];

/** Pad a binary number to 64 bits */
export type Pad<N extends Binary> = N["length"] extends 64 ? N : Pad<[0, ...N]>;
