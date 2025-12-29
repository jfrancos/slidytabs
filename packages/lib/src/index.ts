import { twMerge } from "tailwind-merge";
import {
  categorizeClasses,
  safelistGeneralizedClasses,
  getCurrentTargetX,
} from "./util";

const defaultTransitionDuration = 0.2 * 1000;
// const defaultTransitionDuration = 1000;

type RefTarget = Element | { $el: Element } | string | null;
type RefCallback = (node: RefTarget, refs?: unknown) => void;
const setupWithOptions = (ref: RefTarget, options: TabsliderOptions) => {
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

export type RangeValue = [start: number, end: number];

interface Update {
  activeEdge: number | null;
  index: number;
  trigger?: HTMLElement;
}

// TODO none of these should be optional
interface TabsliderOptions {
  value?: RangeValue;
  swipe: boolean;
  onValueChange?: (update: Update, instance: Slidytabs) => void;
  controlled: boolean;
}
// how to get values?
const instances = new WeakMap<HTMLElement, Slidytabs>();
const getInstance = (el: HTMLElement) => {
  let instance = instances.get(el);
  if (instance === undefined) {
    instance = new Slidytabs(el);
    instances.set(el, instance);
  }
  return instance;
};

interface SliderOptions {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const tabs =
  ({ value, onValueChange }: SliderOptions = {}): RefCallback =>
  (root) => {
    const controlled = value != null || onValueChange != null;
    return setupWithOptions(root, {
      controlled,
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
  ({ value, onValueChange }: SliderOptions = {}): RefCallback =>
  (root) => {
    const controlled = value != null || onValueChange != null;
    return setupWithOptions(root, {
      controlled,
      swipe: true,
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

export const range =
  ({
    value,
    onValueChange,
  }: {
    value: RangeValue;
    onValueChange?: (value: RangeValue) => void;
  }) =>
  (root: HTMLElement | null) => {
    return setupWithOptions(root, {
      controlled: true,
      swipe: true,
      value,
      onValueChange: ({ index, activeEdge }: Update, instance: Slidytabs) => {
        if (activeEdge === null) {
          // triggered from data-state observer
          return;
        }
        const newValue = instance.value.with(activeEdge, index) as RangeValue;
        // instance.updateValue(newValue);
        onValueChange?.(newValue);
      },
    });
  };

class Slidytabs {
  #root;
  #swipe!: boolean;
  #slidytab!: HTMLDivElement;
  // #_value!: [number, number];
  value!: [number, number];
  #onValueChange?: (update: Update, instance: Slidytabs) => void;
  #resizeObserver;
  #dataStateObserver;
  #down: number | null = null;
  #classes!: {
    // activeText: string[];
    activeIndicator: string[];
    focusText: string[];
    focusIndicator: string[];
    base: string[];
  }[];
  #_transitionDuration = defaultTransitionDuration;
  #orientation!: "horizontal" | "vertical";
  #list!: HTMLDivElement;
  #triggers!: HTMLButtonElement[];
  #trigger!: HTMLButtonElement;
  #isFocused = false;
  #isMoving = false;
  #controlled = false;

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#extractFromDOM();
    // this.#classes = categorizeClasses([...this.#trigger.classList]);
    this.#classes = categorizeClasses(this.#triggers);
    safelistGeneralizedClasses(this.#trigger);
    this.#slidytab = this.#setupSlidytab();
    this.#onblur();
    this.#list.addEventListener("pointerdown", this.#onpointerdown, true);
    this.#list.addEventListener("pointerup", this.#onpointerup);
    this.#list.addEventListener("pointermove", this.#onpointermove, true);
    this.#resizeObserver = this.#setupResizeObserver();
    this.#setupFakeFocus();
    const triggerStyles: Partial<CSSStyleDeclaration> = {
      zIndex: "10",
      // backgroundColor: "transparent",
      touchAction: "none",
      outline: "unset",
    };
    for (const trigger of this.#triggers) {
      Object.assign(trigger.style, triggerStyles);
    }
    this.#list.append(this.#slidytab);
    this.#dataStateObserver = this.#setupDataStateObserver();
    console.log(this.#classes);
  }

  setOptions = ({
    value,
    onValueChange,
    swipe,
    controlled,
  }: TabsliderOptions) => {
    this.#onValueChange = onValueChange;
    this.updateValue(value ?? [this.activeIndex, this.activeIndex]);
    this.#swipe = swipe;
    this.#controlled = controlled ?? false;
  };

  #extractFromDOM = () => {
    // console.log(this.#root);
    this.#triggers = [...this.#root.querySelectorAll("button")];
    // console.log(this.#triggers);
    this.#trigger = this.#triggers[0];
    const list = this.#trigger.closest(
      "div[role=tablist]"
    ) as HTMLDivElement | null;
    if (!list) {
      throw new Error("No list element");
    }
    this.#list = list;
    // const { orientation } = this.#root.dataset
    const orientation = this.#root.dataset.orientation ?? "horizontal";
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Invalid orientation");
    }
    this.#orientation = orientation;
  };

  #onpointerdown = (e: PointerEvent) => {
    // must be a better place for this if we really care
    // mutation observer?
    this.#extractFromDOM();
    const { index } = this.#triggerFromEvent(e);
    if (index === undefined) {
      return;
    }

    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.#getEndpoints();
    // TODO does this work for vertical
    this.#down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
    if (this.#controlled) {
      e.preventDefault();
      this.#onValueChange?.({ index, activeEdge: this.#down }, this);
    }
  };

  #click = (trigger: HTMLElement) => {
    // vue, react
    trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    // svelte, astro
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // trigger.focus();
  };

  #onpointerup = () => {
    // #onpointerup = (e: PointerEvent) => {
    // const { trigger } = this.#triggerFromEvent(e);
    this.#down = null;
    this.#isMoving = false;
    // drag for `tab` is selecting erroneously
    // trigger?.click();
    // trigger?.focus();
  };

  #triggerFromEvent = (e: PointerEvent) => {
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    if (!trigger) {
      return {};
    }
    const index = this.#triggers.indexOf(trigger);
    return { index, trigger };
  };

  #onpointermove = (e: PointerEvent) => {
    // e.preventDefault();

    if (e.buttons === 0) {
      this.#down = null;
      this.#isMoving = false;
    }
    if (!this.#swipe || this.#down === null) {
      return;
    }
    this.#isMoving = true;
    const { trigger } = this.#triggerFromEvent(e);
    if (!trigger) {
      return;
    }
    this.#click(trigger);
  };

  updateValue = (value: RangeValue) => {
    if (value[0] > value[1]) {
      return;
    }

    // if (isEqual(value, this.value)) {
    //   return;
    // }
    this.#slidytab.style.transitionDuration =
      this.#isFocused || (this.#down !== null && !this.#isMoving)
        ? this.transitionDuration
        : "0ms";
    if (
      this.value &&
      value[0] === this.value[0] &&
      value[1] === this.value[1]
    ) {
      return;
    }
    console.log(value);
    this.value = value;
    this.#updateUI();
  };

  #updateUI = () => {
    for (let i = 0; i < this.#triggers.length; i++) {
      this.#triggers[i].dataset.state =
        i >= this.value[0] && i <= this.value[1] ? "active" : "inactive";
      this.#triggers[i].className = twMerge(this.#classes[i].base);
      // this.#triggers[i].className = twMerge(
      //   this.#classes[i].base,
      //   i >= this.value[0] && i <= this.value[1] && this.#classes[i].activeText
      // );
    }
    const leftRect = this.#triggers[this.value[0]].getBoundingClientRect();
    const rightRect = this.#triggers[this.value[1]].getBoundingClientRect();
    const parentRect = this.#list.getBoundingClientRect();
    const left = `${leftRect.left - parentRect.left}px`;
    const top = `${leftRect.top - parentRect.top}px`;
    const bottom = `${parentRect.bottom - leftRect.bottom}px`;
    const right = `${parentRect.right - rightRect.right}px`;
    Object.assign(this.#slidytab.style, { left, top, bottom, right });
  };

  #onfocus = ({ currentTarget }: Event) => {
    if (
      !(currentTarget instanceof Element) ||
      !currentTarget.matches(":focus-visible")
    ) {
      return;
    }
    this.#isFocused = true;
    this.#slidytab.className = twMerge(
      this.#classes[this.value[0]].base,
      this.#classes[this.value[0]].activeIndicator,
      this.#classes[this.value[0]].focusIndicator
    );
  };

  #onblur = () => {
    // otherwise slides are slow folling keyboard input
    this.#isFocused = false;
    console.log(this.value);
    this.#slidytab.className = twMerge(
      this.#classes[this.value?.[0] ?? 0].base,
      this.#classes[this.value?.[0] ?? 0].activeIndicator
    );
  };

  #setupFakeFocus = () => {
    for (const trigger of this.#triggers) {
      trigger.addEventListener("focus", this.#onfocus);
      trigger.addEventListener("blur", this.#onblur);
      trigger.addEventListener("keydown", this.#onfocus, true);
    }
  };

  get transitionDuration(): string {
    return `${this.#_transitionDuration}ms`;
  }

  set transitionDuration(duration: number) {
    this.#_transitionDuration = duration;
  }

  get activeIndex() {
    const activeElement = this.#root.querySelector<HTMLButtonElement>(
      "button[data-state=active]"
    );
    if (!activeElement) {
      // TODO this is problematic
      return -1;
      // return 0;
    }
    return this.#triggers.indexOf(activeElement);
  }

  #setupSlidytab = () => {
    const slidytab = document.createElement("div");
    const slidytabStyles: Partial<CSSStyleDeclaration> = {
      transitionProperty: "all",
      position: "absolute",
      height: "unset",
      outlineColor: "transparent",
      // zIndex: "10"
    };
    Object.assign(slidytab.style, slidytabStyles);
    this.#list.style.position = "relative";
    return slidytab;
  };

  // get value() {
  //   return this.#_value;
  // }

  #setupResizeObserver = () => {
    const resizeObserver = new ResizeObserver(() => {
      this.#slidytab.style.transitionDuration = "0ms";
      this.updateValue(this.value);
      // this.value = this.value;
    });
    resizeObserver.observe(this.#list);
    return resizeObserver;
  };

  #getEndpoints = () => {
    const [x0, x1] = this.value;
    return [
      this.#triggers[x0].offsetLeft,
      this.#triggers[x1].offsetLeft + this.#triggers[x1].offsetWidth,
    ];
  };

  #setupDataStateObserver = () => {
    const dataStateObserver = new MutationObserver(() => {
      this.#onValueChange?.(
        {
          index: this.activeIndex,
          activeEdge: null,
          trigger: this.#triggers[this.activeIndex],
        },
        this
      );
    });
    dataStateObserver.observe(this.#list, {
      subtree: true,
      attributeFilter: ["data-state"],
    });
    return dataStateObserver;
  };

  destroyIfDisconnected() {
    // verify lifecycle stuff
    console.log("destroying");
    if (this.#root.isConnected) {
      return;
    }
    console.log("really destroying");
    this.#list.removeEventListener("pointerdown", this.#onpointerdown);
    this.#list.removeEventListener("pointermove", this.#onpointermove);
    this.#resizeObserver.disconnect();
    this.#dataStateObserver?.disconnect();
    for (const trigger of this.#triggers) {
      trigger.removeEventListener("focus", this.#onfocus);
      trigger.removeEventListener("blur", this.#onblur);
      trigger.removeEventListener("keydown", this.#onfocus, true);
    }
    instances.delete(this.#root);
  }
}

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
