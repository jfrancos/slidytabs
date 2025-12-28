import { tabs, slider, range } from "slidytabs";

// Values represent tab indices.

// Make tabs slide
// tabs(options?: { value?: number; onValueChange?: (value: number) => void })

// Looks like tabs, feels like a slider
// slider(options?: { value?: number; onValueChange?: (value: number) => void })

// Looks like tabs, feels like a range slider
// range(options?: { value?: [number, number]; onValueChange?: (value: [number, number]) => void })

// All of these return a function, automatically called by your framework:
// (target: Element) => void