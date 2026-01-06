# slidytabs

A DOM-level utility for animating shadcn `<Tabs />`. Works with [shadcn](https://ui.shadcn.com/docs/components/tabs), [shadcn-svelte](https://www.shadcn-svelte.com/docs/components/tabs), and [shadcn-vue](https://www.shadcn-vue.com/docs/components/tabs).

## Install

```
npm i slidytabs
```

## Quick start

```
import { tabs } from "slidytabs";
import { Tabs, … } from "@/components/ui/tabs"

<Tabs ref={tabs()}>
…
</ Tabs>
```

## Usage

```
import { tabs, slider, range } from "slidytabs";
```

### Make tabs slide with `tabs()`

`value` is a single index. If you want to control it, you can still do so using shadcn’s `value`/`onValueChange` props, or use `slidytab`’s index-based props.

```
tabs({ value?, onValueChange? });
```

### Make tabs a slider with `slider()`

Same as `tabs()`, with a draggable tab.

`sticky: number` appears visually as a range slider, with one fixed endpoint. `sticky` is not compatible with `shadcn` control props.

```
slider({ value?, onValueChange?, sticky? });
```

### Make tabs a range slider with `range()`

`value` is a pair of indices `[start, end]`. Not compatible with `shadcn` control props.

`push: boolean` lets one endpoint push the other.

```
range({ value, onValueChange?, push? });
```

## Add to your `<Tabs />` component

`tabs()`, `slider()`, and `range()` each return a [`ref` callback function](https://react.dev/reference/react-dom/components/common#ref-callback), to be called by your framework.

#### React

```
<Tabs ref={tabs()} />
```

#### Vue

```
<Tabs :ref="tabs()" />
```

#### Svelte

```
<Tabs {@attach tabs()} />
```

Examples/demo at https://slidytabs.dev
