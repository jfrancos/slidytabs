# slidytabs

A DOM-level utility for animating shadcn `<Tabs />`. Not a `<Tabs />` edit or replacement; it simply adds animation while you use `shadcn` the way you normally use `shadcn`.

Works with [`shadcn`](https://ui.shadcn.com/docs/components/tabs), [`shadcn-svelte`](https://www.shadcn-svelte.com/docs/components/tabs), and [`shadcn-vue`](https://www.shadcn-vue.com/docs/components/tabs).

## Install

```bash
npm i slidytabs
```

## Quick start

`tabs()`, `slider()`, and `range()` each return a setup function, automatically called by your framework.

### React

```tsx
import { tabs } from "slidytabs";
import { Tabs } from "@/components/ui/tabs";

<Tabs ref={tabs()}>
  …
</Tabs>
```

[What's a ref callback?](https://react.dev/reference/react-dom/components/common#ref-callback)

### Svelte

```svelte
import { tabs } from "slidytabs";
import * as Tabs from "$lib/components/ui/tabs/index.js";

<Tabs.Root {@attach tabs()}>
  …
</Tabs>
```

[What's an attachment?](https://svelte.dev/docs/svelte/@attach)

### Vue

```vue
import { tabs } from "slidytabs";
import { Tabs } from "@/components/ui/tabs";

<Tabs :ref="tabs()">
  …
</Tabs>
```

[What's a ref callback?](https://vuejs.org/guide/essentials/template-refs#function-refs)

## Usage

```ts
import { tabs, slider, range } from "slidytabs";
```

`tabs()` adds a sliding animation where active tab updates would normally jump. `slider()` and `range()` add additional functionality.

### Make tabs slide with `tabs()`

`value` is a single index. `tabs()` works uncontrolled, or can be controlled via `shadcn`’s semantic value/onValueChange props or via `slidytabs`’ index-based props.

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

Examples/demo at https://slidytabs.dev

## Bugs

Getting this to work requires some `document.styleSheets` acrobatics, and this is an early release, so edge cases likely exist.

Please open issues, especially if your Tabs component works as expected without `slidytabs`, but behaves unexpectedly once `slidytabs` is applied.
