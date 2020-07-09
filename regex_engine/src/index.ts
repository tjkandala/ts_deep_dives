/**
 * "Implementing a Regular Expression Engine"
 *
 * reference: https://deniskyashif.com/2019/02/17/implementing-a-regular-expression-engine/
 *
 * "first, we'll briefly cover some theoretical foundations":
 * - finite automaton/state mahcine is an abstract machine that has states and transitions
 * between those states. it is always in one of its states and while it reads an input it switches
 * from state to state. it has a start state and can have one or more end (accepting) states.
 * - deterministic finite automata (DFA): if at each state for a iven valid input symbol,
 * we can end up in exactly one state, we say that the machine is deterministic
 *
 * - the set of strings recognized by a finite automaton A is called the language of A and is denoted
 * as L(A). If a language can be recognized by a finite automaton then there's a
 * corresponding regular expression that describes the same language and vice versa.
 * - in other words, regular expressions can be thought of as a user-friendly alternative to finite
 * automata for describing patterns in text.
 */
