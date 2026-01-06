# slidytabs

A DOM-level utility for animating shadcn `<Tabs />`. that lets you use shadcn the way you normally use shadcn. Works with [shadcn](https://ui.shadcn.com/docs/components/tabs), [shadcn-svelte](https://www.shadcn-svelte.com/docs/components/tabs), and [shadcn-vue](https://www.shadcn-vue.com/docs/components/tabs).

## Install

```bash
npm i slidytabs
```

## Quick start

```tsx
import { tabs } from "slidytabs";
import { Tabs } from "@/components/ui/tabs";

<Tabs ref={tabs()}>…</Tabs>;
```

## Usage

```ts
import { tabs, slider, range } from "slidytabs";
```

`tabs()` adds a sliding animation where active tab updates would normally jump. `slider()` and `range()` add additional functionality.

### Make tabs slide with `tabs()`

`value` is a single index. `tabs()` can be controlled either via `shadcn`’s semantic value/onValueChange props or via `slidytabs`’ index-based props.

```ts
tabs(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
});
```

### Make tabs a slider with `slider()`

Same as `tabs()`, with a draggable tab.

`sticky: number` appears visually as a range slider, with one fixed endpoint. `sticky` is not compatible with `shadcn` control props.

```ts
slider(options?: {
  value?: number;
  onValueChange?: (value: number) => void;
  sticky?: number;
});
```

### Make tabs a range slider with `range()`

`value` is a pair of indices `[start, end]`. Not compatible with `shadcn` control props.

`push: boolean` lets one endpoint push the other.

```ts
range(options?: {
  value: [number, number];
  onValueChange?: (value: [number, number]) => void;
  push?: boolean;
});
```

## Add to your `<Tabs />` component

`tabs()`, `slider()`, and `range()` each return a setup function that your framework calls with the `<Tabs />` root element.

#### React

```tsx
<Tabs ref={tabs()} />
```

([ref callbacks](https://react.dev/reference/react-dom/components/common#ref-callback))

#### Vue

```vue
<Tabs :ref="tabs()" />
```

([ref callbacks](https://vuejs.org/guide/essentials/template-refs#function-refs))

#### Svelte

```svelte
<Tabs {@attach tabs()} />
```

([svelte attachments](https://svelte.dev/docs/svelte/@attach))

Examples/demo at https://slidytabs.dev
