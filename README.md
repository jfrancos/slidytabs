# Slidytabs

A DOM-level utility for animating shadcn `<Tabs />`

## Install

```
npm i slidytabs
```

## API

```
import { tabs, slider, range } from "slidytabs";
```

## Make tabs slide
```
// single index
tabs({ value?, onValueChange? });
```

## Make tabs a slider
``
// single index, draggable
// `sticky: number` appears visually as range, with one fixed 
endpoint
slider({ value?, onValueChange?, sticky? });
```

## Make tabs a range slider
```
// [start, end] indices
// `push: boolean` lets one endpoint push the other
range({ value, onValueChange?, push? });
```

Each returns `(target: Element) => void`, to be called by your framework
```
tabs()(TabsRootElement)
```

Examples/demo at https://slidytabs.dev