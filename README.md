# ts-golfscript

This repository is my efforts to write an implementation of GolfScript in just
the type system of TypeScript, so that GolfScript code can be written and
interpreted at compile-time within TypeScript code. It's a pretty obscure goal
but I'm excited to get things going with it. So far, I've made what I think is a
correct parser / interpreter structure, but I have yet to implement the many
built-in functions of GolfScript.

Part of what makes this so difficult is the lack of arithmetic operations in
TypeScript's type system, meaning operations as simple as addition and
subtraction all the way up to base conversions all have to be written from the
ground-up. 64 bit integers are represented by length-64 tuples of 0s and 1s.

When the interpreter is finished, I hope to attempt to write a golfed version of
it, although that might be out-of-scope for this project given the size of the
program.
