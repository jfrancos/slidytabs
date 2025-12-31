import { tabs, slider, range } from "slidytabs";

// single tab index
tabs({ value?, onValueChange? });

// single tab index, draggable
// `sticky` fixes one side of the slider visually
// e.g. sticky: [0] or sticky: [, 5]
slider({ value?, onValueChange?, sticky? });

// [start, end] indices
range({ value, onValueChange? });

// These all return a function, called with the root element by the framework
