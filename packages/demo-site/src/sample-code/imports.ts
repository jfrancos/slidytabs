import { tabs, slider, range } from "slidytabs";

// single index
tabs(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
});

// single index, draggable
// `sticky: number` appears visually as range, with one fixed endpoint
slider(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
  sticky?: number;
});

// [start, end] indices
// `push: boolean` lets one endpoint push the other
range(options?: {
  value: [number, number];
  onValueChange?: (value: [number, number]) => void;
  push?: boolean;
});


// Each returns (target: Element) => void
// To be called by your framework (examples below)
tabs()(TabsRootElement)
