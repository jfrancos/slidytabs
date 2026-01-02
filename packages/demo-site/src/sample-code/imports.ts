import { tabs, slider, range } from "slidytabs";

// single tab index
tabs({ value?, onValueChange? });

// single tab index, draggable
// `sticky` fixes one side of the slider visually
// e.g. sticky: [0] or sticky: [, 5]
slider({ value?, onValueChange?, sticky? });

// [start, end] indices
// `push` lets one endpoint push the other
range({ value, onValueChange?, push? });

// These all return a function, called with the root element by your framework
