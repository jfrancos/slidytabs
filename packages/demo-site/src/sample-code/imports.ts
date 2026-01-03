import { tabs, slider, range } from "slidytabs";

// single tab index
tabs({ value?, onValueChange? });

// single tab index, draggable
// `sticky` fixes one side of the slider visually
slider({ value?, onValueChange?, sticky? });

// [start, end] indices
// `push` lets one endpoint push the other
range({ value, onValueChange?, push? });


// Each returns (target: Element) => void
tabs()(TabsRootElement)
// but it’s intended to be called by your framework
