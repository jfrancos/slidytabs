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

### Make tabs slide

single index

```
tabs({ value?, onValueChange? });
```

### Make tabs a slider

single index, draggable
`sticky: number` appears visually as range, with one fixed endpoint

```
slider({ value?, onValueChange?, sticky? });
```

### Make tabs a range slider

[start, end] indices
`push: boolean` lets one endpoint push the other

```
range({ value, onValueChange?, push? });
```

### Add to your `<Tabs />` component

Each returns `(target: Element) => void`, to be called by your framework

#### React

```
ref={tabs()} // or slider() or range()
```

#### Vue

```
:ref="tabs()" // or slider() or range()
```

#### Svelte

```
{@attach tabs()} // or slider() or range()
```

Examples/demo at https://slidytabs.dev
