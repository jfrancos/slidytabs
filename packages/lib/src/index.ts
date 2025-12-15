import { twMerge } from "tailwind-merge";
import { isEqual } from "radashi";
import { categorizeClasses, safelistGeneralizedClasses } from "./util";

type ValueType = number | [number, number];
type SlidyOptions = BaseOptions<number>;
type RangeOptions = BaseOptions<[number, number]>;

export type RangeValue = [number, number];

interface BaseOptions<T extends ValueType> {
  value?: T;
  transitionDuration?: number;
  onValueChange?: (value: T) => void;
  swipe?: boolean;
}

const defaultTransitionDuration = 0.2 * 1000;
const instances = new WeakMap<HTMLElement, Slidytabs>();

export const slidytabs =
  (_options: SlidyOptions = {}) =>
  (tabroot: HTMLElement | null) => {
    if (tabroot === null) {
      return;
    }
    let instance = instances.get(tabroot);
    const options = {
      swipe: true,
      ..._options,
    } as BaseOptions<ValueType>;
    if (!instance) {
      instance = new Slidytabs(tabroot, options);
      instances.set(tabroot, instance);
    } else if (options.value != null) {
      instance.updateValue(options.value);
    }
    return () => {
      queueMicrotask(() => {
        if (tabroot.isConnected) {
          return;
        }
        instance.destroy();
      });
    };
  };

export const rangetabs =
  (_options: RangeOptions = {}) =>
  (tabroot: HTMLElement | null) => {
    if (tabroot === null) {
      return;
    }
    let instance = instances.get(tabroot);
    const options = {
      swipe: true,
      ..._options,
    } as BaseOptions<ValueType>;
    if (!instance) {
      instance = new Slidytabs(tabroot, options);
      instances.set(tabroot, instance);
    } else if (options.value != null) {
      instance.updateValue(options.value);
    }
    return () => {
      queueMicrotask(() => {
        if (tabroot.isConnected) {
          return;
        }
        instance.destroy();
      });
    };
  };

class Slidytabs {
  #root;
  #slidytab!: HTMLDivElement;
  #_value: ValueType = 0;
  #onValueChange?: (value: ValueType) => void;
  #resizeObserver;
  #dataStateObserver;
  #down: number | null;
  #classes!: {
    activeText: string[];
    activeIndicator: string[];
    focusText: string[];
    focusIndicator: string[];
    base: string[];
  };
  #_transitionDuration = defaultTransitionDuration;
  #isMoving;
  #orientation!: "horizontal" | "vertical";
  #list!: HTMLDivElement;
  #triggers!: HTMLButtonElement[];
  #trigger!: HTMLButtonElement;
  #isFocused = false;

  constructor(root: HTMLElement, options: BaseOptions<ValueType> = {}) {
    this.#root = root;
    this.transitionDuration =
      options.transitionDuration || defaultTransitionDuration;
    this.#extractFromDOM();
    this.#classes = categorizeClasses([...this.#trigger.classList]);
    safelistGeneralizedClasses(this.#trigger);
    this.#slidytab = this.#setupSlidytab();
    this.#onblur();
    this.#list.addEventListener("pointerdown", this.#onpointerdown);
    this.#list.addEventListener("pointerup", this.#onpointerup);
    if (options.swipe) {
      this.#list.addEventListener("pointermove", this.#onpointermove);
    }
    this.#onValueChange =
      options.onValueChange ??
      (options.value === undefined
        ? (newValue) => (this.value = newValue)
        : undefined);
    this.#resizeObserver = this.#setupResizeObserver();
    this.#dataStateObserver = this.#setupDataStateObserver();
    this.#down = null;
    this.#setupFakeFocus();
    this.#isMoving = false;
    this.value = options.value ?? this.activeIndex;
    const triggerStyles: Partial<CSSStyleDeclaration> = {
      zIndex: "10",
      touchAction: "none",
      outline: "unset",
    };
    for (const trigger of this.#triggers) {
      Object.assign(trigger.style, triggerStyles);
    }
    this.#list.append(this.#slidytab);
  }

  #extractFromDOM = () => {
    this.#triggers = [...this.#root.querySelectorAll("button")];
    this.#trigger = this.#triggers[0];
    const list = this.#trigger.closest(
      "div[role=tablist]"
    ) as HTMLDivElement | null;
    if (!list) {
      throw new Error("no list");
    }
    this.#list = list;
    const { orientation } = this.#root.dataset;
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("invalid orientation");
    }
    this.#orientation = orientation;
  };

  #onpointerdown = (e: PointerEvent) => {
    this.#extractFromDOM();
    const trigger = (e.target as Element).closest("button");
    if (!trigger) {
      return;
    }
    const pressedIndex = this.#triggers.indexOf(trigger);
    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.#getEndpoints();
    this.#down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    this.#slidytab.style.transitionDuration = this.transitionDuration;
    const newValue = Array.isArray(this.value)
      ? (this.value.with(this.#down, pressedIndex) as [number, number])
      : pressedIndex;
    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    this.#onValueChange?.(newValue);
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
    this.#triggers[pressedIndex].click();
  };

  #onpointerup = () => {
    this.#slidytab.style.transitionDuration = this.transitionDuration;
    this.#down = null;
    this.#isMoving = false;
  };

  #onpointermove = (e: PointerEvent) => {
    if (e.buttons === 0) {
      this.#onpointerup();
    }
    if (this.#down === null) {
      return;
    }
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    if (!trigger) {
      return;
    }
    const i = this.#triggers.indexOf(trigger);
    if (i < 0) {
      return;
    }

    const newValue = Array.isArray(this.value)
      ? (this.value.with(this.#down, i) as [number, number])
      : i;

    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    this.#isMoving = true;
    this.#slidytab.style.transitionDuration = "0ms";
    // sync shadcn state with slidytabs state
    trigger.click();
    // focus trigger so keyboard events come from the correct trigger
    trigger.focus();
    this.#onValueChange?.(newValue);
  };

  set value(newValue: ValueType) {
    this.#_value = newValue;
    if (this.valueDuple[0] > this.valueDuple[1]) {
      throw `${this.valueDuple[0]} is larger than ${this.valueDuple[1]}`;
    }
    for (let i = 0; i < this.#triggers.length; i++) {
      if (i >= this.valueDuple[0] && i <= this.valueDuple[1]) {
        this.#triggers[i].className = twMerge(
          this.#classes.base,
          this.#classes.activeText
        );
      } else {
        this.#triggers[i].className = twMerge(this.#classes.base);
      }
    }
    const leftRect = this.#triggers[this.valueDuple[0]].getBoundingClientRect();
    const rightRect =
      this.#triggers[this.valueDuple[1]].getBoundingClientRect();
    const parentRect = this.#list.getBoundingClientRect();
    const left = `${leftRect.left - parentRect.left}px`;
    const top = `${leftRect.top - parentRect.top}px`;
    const bottom = `${parentRect.bottom - leftRect.bottom}px`;
    const right = `${parentRect.right - rightRect.right}px`;
    Object.assign(this.#slidytab.style, { left, top, bottom, right });
  }

  updateValue = (value: ValueType) => {
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
    // this.slidytab = document.createElement("div");
    const slidytab = document.createElement("div");
    const slidytabStyles: Partial<CSSStyleDeclaration> = {
      transitionDuration: this.transitionDuration,
      transitionProperty: "all",
      position: "absolute",
      height: "unset",
      outlineColor: "transparent",
      inset: "0",
    };
    Object.assign(slidytab.style, slidytabStyles);
    this.#list.style.position = "relative";
    // this.list.append(this.slidytab);
    return slidytab;
  };

  get value() {
    return this.#_value;
  }

  get valueDuple() {
    return Array.isArray(this.value) ? this.value : [this.value, this.value];
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
    const [x0, x1] = this.valueDuple;
    return [
      this.#triggers[x0].offsetLeft,
      this.#triggers[x1].offsetLeft + this.#triggers[x1].offsetWidth,
    ];
  };

  #setupDataStateObserver = () => {
    const dataStateObserver = new MutationObserver(() => {
      if (this.value !== this.activeIndex && !Array.isArray(this.value)) {
        this.#onValueChange?.(this.activeIndex);
      }
    });
    dataStateObserver.observe(this.#list, {
      subtree: true,
      attributeFilter: ["data-state"],
    });
    return dataStateObserver;
  };

  destroy() {
    this.#list.removeEventListener("pointerdown", this.#onpointerdown);
    this.#list.removeEventListener("pointermove", this.#onpointermove);
    this.#resizeObserver.disconnect();
    this.#dataStateObserver?.disconnect();
    for (const trigger of this.#triggers) {
      trigger.removeEventListener("focus", this.#onfocus);
      trigger.removeEventListener("blur", this.#onblur);
      trigger.removeEventListener("keydown", this.#onfocus, true);
    }
  }
}

const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

if (typeof document !== "undefined" && !globalThis.sheet) {
  const sheet = new CSSStyleSheet();
  globalThis.sheet = sheet;
  document.adoptedStyleSheets.push(sheet);
}
