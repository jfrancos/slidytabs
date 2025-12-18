import { twMerge } from "tailwind-merge";
import { isEqual } from "radashi";
import { categorizeClasses, safelistGeneralizedClasses } from "./util";

const defaultTransitionDuration = 0.2 * 1000;

type NumberDuple = [number, number];

interface Update {
  activeEdge: number | null;
  index: number;
  trigger?: HTMLElement;
}

interface TabsliderOptions {
  value?: NumberDuple;
  swipe: boolean;
  transitionDuration?: number;
  onValueChange?: (update: Update, instance: Slidytabs) => void;
}

const instances = new WeakMap<HTMLElement, Slidytabs>();
const getInstance = (el: HTMLElement) => {
  let instance = instances.get(el);
  if (instance === undefined) {
    instance = new Slidytabs(el);
    instances.set(el, instance);
  }
  return instance;
};

export const tabs = () => (root: HTMLElement | null) => {
  return setupSliderWithOptions(root, {
    swipe: false,
    onValueChange: ({ index }, instance: Slidytabs) => {
      instance.updateValue([index, index]);
      // instance.updateTabsContent(index);
    },
  });
};

export const slider =
  ({
    value,
    onValueChange,
    transitionDuration,
  }: {
    value?: number;
    onValueChange?: (value: number) => void;
    transitionDuration?: number;
  } = {}) =>
  (root: HTMLElement | null) => {
    return setupSliderWithOptions(root, {
      value: value ? [value, value] : undefined,
      swipe: true,
      onValueChange: onValueChange
        ? ({ index }: Update, instance) => {
            instance.updateValue([index, index]);
            onValueChange(index);
            // instance.updateTabsContent(index);
          }
        : value
        ? undefined
        : ({ index }: Update, instance: Slidytabs) => {
            // instance.updateTabsContent(index);
            instance.updateValue([index, index]);
          },
      transitionDuration,
    });
  };

export const rangeslider =
  ({
    value,
    onValueChange,
    transitionDuration,
  }: {
    value: NumberDuple;
    onValueChange?: (value: NumberDuple) => void;
    transitionDuration?: number;
  }) =>
  (root: HTMLElement | null) => {
    return setupSliderWithOptions(root, {
      value,
      swipe: true,
      onValueChange: ({ index, activeEdge }: Update, instance: Slidytabs) => {
        if (activeEdge === null) {
          // triggered from data-state observer
          return;
        }
        const newValue = instance.value.with(activeEdge, index) as NumberDuple;
        instance.updateValue(newValue);
        onValueChange?.(newValue);
      },
      transitionDuration,
    });
  };

const setupSliderWithOptions = (
  root: HTMLElement | null,
  options: TabsliderOptions
) => {
  if (!root) {
    return;
  }
  const tabslider = getInstance(root);
  tabslider.setOptions(options);
  return () => tabslider.destroyIfDisconnected();
};

class Slidytabs {
  #root;
  #swipe!: boolean;
  #slidytab!: HTMLDivElement;
  #_value!: [number, number];
  #onValueChange?: (update: Update, instance: Slidytabs) => void;
  #resizeObserver;
  #dataStateObserver;
  #down: number | null = null;
  #classes!: {
    activeText: string[];
    activeIndicator: string[];
    focusText: string[];
    focusIndicator: string[];
    base: string[];
  };
  #_transitionDuration = defaultTransitionDuration;
  #orientation!: "horizontal" | "vertical";
  #list!: HTMLDivElement;
  #triggers!: HTMLButtonElement[];
  #trigger!: HTMLButtonElement;
  #isFocused = false;
  #isMoving = false;

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#extractFromDOM();
    this.#classes = categorizeClasses([...this.#trigger.classList]);
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
      touchAction: "none",
      outline: "unset",
    };
    for (const trigger of this.#triggers) {
      Object.assign(trigger.style, triggerStyles);
    }
    this.#list.append(this.#slidytab);
    this.#dataStateObserver = this.#setupDataStateObserver();
  }

  setOptions = ({
    value,
    onValueChange,
    swipe,
  }: {
    value?: NumberDuple;
    onValueChange?: (update: Update, instance: Slidytabs) => void;
    swipe: boolean;
  }) => {
    this.#onValueChange = onValueChange;
    this.updateValue(value ?? [this.activeIndex, this.activeIndex]);
    this.#swipe = swipe;
  };

  #extractFromDOM = () => {
    this.#triggers = [...this.#root.querySelectorAll("button")];
    this.#trigger = this.#triggers[0];
    const list = this.#trigger.closest(
      "div[role=tablist]"
    ) as HTMLDivElement | null;
    if (!list) {
      throw new Error("No list element");
    }
    this.#list = list;
    const { orientation } = this.#root.dataset;
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Invalid orientation");
    }
    this.#orientation = orientation;
  };

  #onpointerdown = (e: PointerEvent) => {
    this.#extractFromDOM();
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    if (!trigger) {
      return;
    }
    const index = this.#triggers.indexOf(trigger);

    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.#getEndpoints();
    this.#down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    this.#onValueChange?.({ index, activeEdge: this.#down }, this);
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
    // this.#triggers[index].click();
  };

  #onpointerup = () => {
    this.#down = null;
    this.#isMoving = false;
  };

  #onpointermove = (e: PointerEvent) => {
    if (e.buttons === 0) {
      this.#onpointerup();
    }
    if (!this.#swipe || this.#down === null) {
      return;
    }
    this.#isMoving = true;

    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    if (!trigger) {
      return;
    }
    const index = this.#triggers.indexOf(trigger);

    this.#onValueChange?.({ index, activeEdge: this.#down, trigger }, this);
    // sync shadcn state with slidytabs state
    // trigger.click();
    trigger.focus();
  };

  set value(newValue: NumberDuple) {
    this.#_value = newValue;
    if (this.value[0] > this.value[1]) {
      return;
    }
    for (let i = 0; i < this.#triggers.length; i++) {
      this.#triggers[i].className = twMerge(
        this.#classes.base,
        i >= this.value[0] && i <= this.value[1] && this.#classes.activeText
      );
    }
    const leftRect = this.#triggers[this.value[0]].getBoundingClientRect();
    const rightRect = this.#triggers[this.value[1]].getBoundingClientRect();
    const parentRect = this.#list.getBoundingClientRect();
    const left = `${leftRect.left - parentRect.left}px`;
    const top = `${leftRect.top - parentRect.top}px`;
    const bottom = `${parentRect.bottom - leftRect.bottom}px`;
    const right = `${parentRect.right - rightRect.right}px`;
    Object.assign(this.#slidytab.style, { left, top, bottom, right });
  }

  updateValue = (value: NumberDuple) => {
    if (isEqual(value, this.value)) {
      return;
    }
    this.#slidytab.style.transitionDuration =
      this.#isFocused || (this.#down !== null && !this.#isMoving)
        ? this.transitionDuration
        : "0ms";
    this.value = value;
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
      this.#classes.base,
      this.#classes.activeIndicator,
      this.#classes.focusIndicator
    );
  };

  #onblur = () => {
    // otherwise slides are slow folling keyboard input
    this.#isFocused = false;
    this.#slidytab.className = twMerge(
      this.#classes.base,
      this.#classes.activeIndicator
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
    };
    Object.assign(slidytab.style, slidytabStyles);
    this.#list.style.position = "relative";
    return slidytab;
  };

  get value() {
    return this.#_value;
  }

  #setupResizeObserver = () => {
    const resizeObserver = new ResizeObserver(() => {
      this.#slidytab.style.transitionDuration = "0ms";
      this.value = this.value;
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
    if (this.#root.isConnected) {
      return;
    }
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

const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

if (typeof document !== "undefined" && !globalThis.sheet) {
  const sheet = new CSSStyleSheet();
  globalThis.sheet = sheet;
  document.adoptedStyleSheets.push(sheet);
}
