import { twMerge } from "tailwind-merge";
import {
  categorizeClasses,
  safelistGeneralizedClasses,
  getCurrentTargetX,
  clamp,
} from "./util";

const defaultTransitionDuration = 0.2 * 1000;
// const defaultTransitionDuration = 1500;

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
        // console.log(index, activeEdge);
        const edge = instance.down;
        if (edge === null) {
          // if (activeEdge === null) {
          console.log("active edge null");
          // triggered from data-state observer
          return;
        }
        console.log("active edge", edge);
        const newValue = instance.value.with(edge, index) as RangeValue;
        // const newValue = instance.value.with(activeEdge, index) as RangeValue;
        // instance.updateValue(newValue);
        console.log(value);
        console.log(newValue);
        onValueChange?.(newValue);
      },
    });
  };

class Slidytabs {
  #root;
  #swipe!: boolean;
  #slidytab!: HTMLDivElement;
  value!: [number, number];
  #onValueChange?: (update: Update, instance: Slidytabs) => void;
  #resizeObserver;
  #dataStateObserver;
  down: number | null = null;
  #classes!: {
    activeIndicator: string[];
    base: string[];
  }[];
  #_transitionDuration = defaultTransitionDuration;
  #orientation!: "horizontal" | "vertical";
  #list!: HTMLDivElement;
  #triggers!: HTMLButtonElement[];
  #isFocused = false;
  #isMoving = false;
  #slideToken = false;
  #controlled = false;

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#extractFromDOM();
    this.#classes = categorizeClasses(this.#triggers);
    for (const trigger of this.#triggers) {
      safelistGeneralizedClasses(trigger);
    }
    this.#slidytab = this.#setupSlidytab();
    // this.#onblur();
    // this.#list.addEventListener("click", this.#onpointerdown);
    this.#list.addEventListener("pointerdown", this.#onpointerdown, true);
    this.#list.addEventListener("pointerup", this.#onpointerup);
    this.#list.addEventListener("pointermove", this.#onpointermove, true);
    this.#resizeObserver = this.#setupResizeObserver();
    const triggerStyles: Partial<CSSStyleDeclaration> = {
      zIndex: "10",
      // backgroundColor: "transparent",
      touchAction: "none",
      outline: "unset",
    };
    for (const trigger of this.#triggers) {
      Object.assign(trigger.style, triggerStyles);
    }
    for (let i = 0; i < this.#triggers.length; i++) {
      this.#triggers[i].className = twMerge(this.#classes[i].base);
    }
    this.#list.append(this.#slidytab);
    this.#dataStateObserver = this.#setupDataStateObserver();
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
    this.#triggers = [...this.#root.querySelectorAll("button")];
    const list = this.#root.querySelector(
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
    this.#slideToken = true;
    // console.log("down");
    // must be a better place for this if we really care
    // mutation observer?
    this.#extractFromDOM();
    const { index, trigger } = this.#triggerFromEvent(e);
    if (index === undefined) {
      return;
    }

    const tabListX = getCurrentTargetX(e);
    // console.log({ tabListX });
    const [x0, x1] = this.#getEndpoints();
    // console.log(x0, x1);
    // TODO does this work for vertical
    this.down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    // console.log(this.#down);
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
  };

  #onpointerup = () => {
    this.down = null;
    this.#isMoving = false;
  };

  #triggerFromEvent = (e: PointerEvent) => {
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [clamp(e.clientX, x + 5, x + width), y + height / 2] as const,
      vertical: [x + width / 2, clamp(e.clientY, y, y + height)] as const,
    }[this.#orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    // console.log(trigger?.textContent);
    if (!trigger) {
      return {};
    }
    const index = this.#triggers.indexOf(trigger);
    return { index, trigger };
  };

  #onpointermove = (e: PointerEvent) => {
    if (e.buttons === 0) {
      this.down = null;
      this.#isMoving = false;
    }
    if (!this.#swipe || this.down === null) {
      return;
    }
    this.#isMoving = true;
    const { trigger } = this.#triggerFromEvent(e);
    if (!trigger) {
      return;
    }
    trigger.focus();
    this.#onValueChange?.(
      {
        index: this.#triggers.indexOf(trigger),
        activeEdge: null,
        trigger: trigger,
      },
      this
    );
    // preventscroll?
  };

  updateValue = (value: RangeValue) => {
    if (value[0] > value[1]) {
      return;
    }

    const isFocused = this.#list.contains(document.activeElement);

    this.#slidytab.style.transitionDuration =
      (this.down !== null && this.#slideToken) ||
      (this.down === null && isFocused)
        ? this.transitionDuration
        : "0ms";
    if (
      this.value &&
      value[0] === this.value[0] &&
      value[1] === this.value[1]
    ) {
      return;
    }
    this.value = value;
    this.#slideToken = false;
    this.#updateIndicatorUI();
    // console.log(this.#isFocused);
    this.#updateTriggersUI();
  };

  #updateIndicatorUI = () => {
    if (!this.value) {
      return;
    }
    this.#slidytab.className = twMerge(
      this.#classes[this.value?.[0] ?? 0].base,
      this.#classes[this.value?.[0] ?? 0].activeIndicator
    );
    const leftRect = this.#triggers[this.value[0]].getBoundingClientRect();
    const rightRect = this.#triggers[this.value[1]].getBoundingClientRect();
    const parentRect = this.#list.getBoundingClientRect();
    const left = `${leftRect.left - parentRect.left}px`;
    const top = `${leftRect.top - parentRect.top}px`;
    const bottom = `${parentRect.bottom - leftRect.bottom}px`;
    const right = `${parentRect.right - rightRect.right}px`;
    Object.assign(this.#slidytab.style, { left, top, bottom, right });
  };

  #updateTriggersUI = () => {
    this.#dataStateObserver?.disconnect();

    for (let i = 0; i < this.#triggers.length; i++) {
      const targetState =
        i >= this.value[0] && i <= this.value[1] ? "active" : "inactive";
      if (this.#triggers[i].dataset.state !== targetState) {
        this.#triggers[i].dataset.state = targetState;
      }

      // This should go somewhere else:
      // this.#triggers[i].className = twMerge(this.#classes[i].base);
    }
    this.#dataStateObserver.observe(this.#list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
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
      return -1;
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
    const dataStateObserver = new MutationObserver(
      (mutationList: MutationRecord[]) => {
        requestAnimationFrame(() => {
          for (const observation of mutationList) {
            if (
              observation.target instanceof HTMLButtonElement &&
              observation.target.dataset.state === "active"
            ) {
              const index = this.#triggers.indexOf(observation.target);
              console.log(index);
              this.#slidytab.className = twMerge(
                this.#classes[this.value?.[index] ?? 0].base,
                this.#classes[this.value?.[index] ?? 0].activeIndicator
              );
              this.#onValueChange?.(
                {
                  index,
                  activeEdge: this.down,
                  trigger: observation.target,
                },
                this
              );
              requestAnimationFrame(() => {
                this.#updateTriggersUI();
              });
            }
          }
        });
      }
    );
    dataStateObserver.observe(this.#list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return dataStateObserver;
  };

  destroyIfDisconnected() {
    // verify lifecycle stuff
    // console.log("destroying");
    if (this.#root.isConnected) {
      return;
    }
    console.log("really destroying");
    this.#list.removeEventListener("pointerdown", this.#onpointerdown);
    this.#list.removeEventListener("pointermove", this.#onpointermove);
    this.#resizeObserver.disconnect();
    this.#dataStateObserver?.disconnect();
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

// Parity notes:
// (shadcn-react, with or without slidytabs)
// focus ring on keyboard input works in chrome but not firefox/safari
