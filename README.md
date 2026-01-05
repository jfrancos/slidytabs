# Slidytabs

A DOM-level utility for animating shadcn `<Tabs />`

## Install

```
npm i slidytabs
```

## Usage

```
import { tabs, slider, range } from "slidytabs";
```

### Make tabs slide

`value` is a single index

```
tabs({ value?, onValueChange? });
```

### Make tabs a slider

same as `tabs`, `value` is a single index, with a draggable tab

`sticky: number` appears visually as range, with one fixed endpoint

```
slider({ value?, onValueChange?, sticky? });
```

### Make tabs a range slider

`value` is a pair of indices `[start, end]`

`push: boolean` lets one endpoint push the other

```
range({ value, onValueChange?, push? });
```

## Add to your `<Tabs />` component

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
