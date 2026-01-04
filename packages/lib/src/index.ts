import {
  Slidytabs,
  Update,
  RangeValue,
  SlidytabOptions,
  instances,
} from "./slidytabs.js";

export type { RangeValue };

type RefTarget = Element | { $el: Element } | string | null;
type RefCallback = (node: RefTarget, refs?: unknown) => void;

const setupWithOptions = (ref: RefTarget, options: SlidytabOptions) => {
  const elements =
    typeof ref === "string"
      ? // For adding in a <script> e.g. starwind
        document.querySelectorAll(ref)
      : ref instanceof Element
      ? [ref]
      : ref?.$el instanceof Element
      ? [ref.$el]
      : [];

  if (typeof ref === "string" && elements.length === 0) {
    throw new Error(`Selector "${ref}" yielded no elements`);
  }

  const instances: Slidytabs[] = [];
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    const instance = getInstance(el);
    instance.setOptions(options);
    instances.push(instance);
  }

  return () => {
    for (const instance of instances) {
      instance.destroyIfDisconnected();
    }
  };
};

// TODO none of these should be optional

const getInstance = (el: HTMLElement) => {
  let instance = instances.get(el);
  if (instance === undefined) {
    instance = new Slidytabs(el);
    instances.set(el, instance);
  }
  return instance;
};

export interface TabOptions {
  value?: number;
  onValueChange?: (value: number) => void;
}
export interface SliderOptions {
  value?: number;
  onValueChange?: (value: number) => void;
  sticky?: number;
}
export interface RangeOptions {
  value: [number, number];
  onValueChange?: (value: [number, number]) => void;
  push?: boolean;
}

export const tabs =
  ({ value, onValueChange }: TabOptions = {}): RefCallback =>
  (root) => {
    const controlled = value != null || onValueChange != null;
    return setupWithOptions(root, {
      push: false,
      swipe: false,
      value: value != null ? [value, value] : undefined,
      onValueChange: ({ index }, instance) => {
        if (controlled) {
          onValueChange?.(index);
        } else {
          instance.updateValue([index, index]);
        }
      },
    });
  };

export const slider =
  ({ value, onValueChange, sticky }: SliderOptions = {}): RefCallback =>
  (root) => {
    const controlled = value != null || onValueChange != null;
    const stickyValue = (value: number) =>
      [sticky ?? value, value].toSorted((a, b) => a - b) as RangeValue;
    return setupWithOptions(root, {
      push: true,
      swipe: true,
      value: value != null ? stickyValue(value) : undefined,
      onValueChange: ({ index }, instance) => {
        if (controlled) {
          onValueChange?.(index);
        } else {
          instance.updateValue(stickyValue(index));
        }
      },
    });
  };

export const range =
  ({ value, onValueChange, push = false }: RangeOptions): RefCallback =>
  (root) => {
    return setupWithOptions(root, {
      push,
      swipe: true,
      value,
      onValueChange: ({ index, activeEdge, value }: Update, instance) => {
        if (activeEdge === null) {
          return;
        }
        const newValue = value.with(activeEdge, index) as RangeValue;
        onValueChange?.(newValue);
      },
    });
  };

if (typeof document !== "undefined" && !globalThis.sheet) {
  const sheet = new CSSStyleSheet();
  globalThis.sheet = sheet;
  document.adoptedStyleSheets.push(sheet);
}

// https://github.com/huntabyte/bits-ui/blob/main/packages/bits-ui/src/lib/bits/tabs/tabs.svelte.ts
// https://github.com/radix-ui/primitives/blob/main/packages/react/tabs/src/tabs.tsx
// https://github.com/unovue/reka-ui/blob/v2/packages/core/src/Tabs/TabsTrigger.vue
// https://github.com/starwind-ui/starwind-ui/blob/main/packages/core/src/components/tabs/Tabs.astro
// https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/tabs/tabs-trigger.tsx

// Parity notes:
// (shadcn-react, with or without slidytabs)
// focus ring on keyboard input works in chrome but not firefox/safari
