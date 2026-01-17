# slidytabs

A DOM-level utility for animating shadcn `<Tabs />`

Works with [`shadcn`](https://ui.shadcn.com/docs/components/tabs), [`shadcn-svelte`](https://www.shadcn-svelte.com/docs/components/tabs), and [`shadcn-vue`](https://www.shadcn-vue.com/docs/components/tabs).

Examples/demo at https://slidytabs.dev

## Why this exists

- **`tabs()`**: shadcn `<Tabs />` jump between positions, which can feel abrupt in motion-oriented UIs. A solution should work with Tabs _as-is_, not as a wrapper or replacement.

- **`slider()` / `range()`**: Sometimes you want the semantics of a radio button or select, with the linearity and tactility of a slider. This comes up often when selecting from small, discrete sets where sliders feel _almost_ right, but slightly wrong. Think clothing sizes, days of the week, months, tip amounts, or school grades. [See this UX StackExchange discussion](https://ux.stackexchange.com/questions/122217/what-is-the-best-ui-component-to-make-user-select-a-number-from-small-range-1-1).

## Install

```bash
npm i slidytabs
```

## Quick start

`tabs()` adds a sliding animation where `value` updates would normally be “jumpy”. Use `slider()` or `range()` instead, for additional functionality. `tabs()`, `slider()`, and `range()` each return a setup function, automatically called by your framework.

### React

```tsx
import { tabs } from "slidytabs";
import { Tabs } from "@/components/ui/tabs";

<Tabs ref={tabs()}>
  …
</Tabs>;
```

[What’s a ref callback?](https://react.dev/reference/react-dom/components/common#ref-callback)

### Svelte

```svelte
<script lang="ts">
  import { tabs } from "slidytabs";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
</script>

<Tabs.Root {@attach tabs()}>
  …
</Tabs>
```

[What’s an attachment?](https://svelte.dev/docs/svelte/@attach)

### Vue

```vue
<script setup lang="ts">
import { tabs } from "slidytabs";
import { Tabs } from "@/components/ui/tabs";
</script>

<Tabs :ref="tabs()">
  …
</Tabs>
```

[What’s a ref callback?](https://vuejs.org/guide/essentials/template-refs#function-refs)

## Usage

```ts
import { tabs, slider, range } from "slidytabs";
```

### Make tabs slide with `tabs()`

`value` is a single index. `tabs()` works uncontrolled, or can be controlled via `shadcn`’s `value`/`onValueChange` props _or_ via `slidytabs`’ index-based props.

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

## Bugs

Getting this to work requires some `document.styleSheets` acrobatics, and this is an early release, so edge cases likely exist.

Please open issues, especially if your Tabs component works as expected without `slidytabs`, but behaves unexpectedly once `slidytabs` is applied.
