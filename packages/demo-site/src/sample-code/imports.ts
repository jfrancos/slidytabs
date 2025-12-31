import { tabs, slider, range } from "slidytabs";

// Values are tab indices.

// Make tabs slide
declare function tabs(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
});

// Make tabs a slider (same as above + swipe)
declare function slider(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
});

// Make tabs a range slider
declare function range(options?: {
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
});

// All of these return a function, automatically called by your framework:
// (target: Element) => void
