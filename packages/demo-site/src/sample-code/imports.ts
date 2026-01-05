import { tabs, slider, range } from "slidytabs";

// single index
tabs({ value?, onValueChange? });

// single index, draggable
// `sticky: number` appears visually as range, with one fixed endpoint
slider({ value?, onValueChange?, sticky? });

// [start, end] indices
// `push: boolean` lets one endpoint push the other
range({ value, onValueChange?, push? });


// Each returns (target: Element) => void
// To be called by your framework (examples below)
tabs()(TabsRootElement)
