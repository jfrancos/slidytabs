import { twMerge } from "tailwind-merge";
import { isEqual } from "radashi";
import { categorizeClasses, safelistGeneralizedClasses } from "./util";

const defaultTransitionDuration = 0.2 * 1000;

type NumberDuple = [number, number];

interface Update {
  activeEdge: number;
  index: number;
}

interface TabsliderOptions {
  value?: NumberDuple;
  swipe: boolean;
  transitionDuration?: number;
  onStateChange?: (index: number, instance: Slidytabs) => void;
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
    onStateChange: (index, instance: Slidytabs) => {
      console.log("hi");
      instance.updateValue([index, index]);
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
      onStateChange: (index, instance: Slidytabs) => {
        console.log("slider update");
        instance.updateValue([index, index]);
        onValueChange?.(index);
      },
      onValueChange: ({ index }: Update, instance: Slidytabs) => {
        instance.updateValue([index, index]);
        onValueChange?.(index);
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
        // instance.updateValue([index, index]);
        console.log("hit");
        const newValue = instance.value.with(activeEdge, index) as NumberDuple;
        console.log("rangeslider newval", newValue);
        instance.updateValue(newValue);
        onValueChange?.(newValue);
      },
      transitionDuration,
    });
  };

// export const rangeslider =
//   ({ value, onValueChange, transitionDuration }: { value: NumberDuple }) =>
//   (root: HTMLElement | null) => {
//     return setupSliderWithOptions(root, {
//       swipe: true,
//     });
//   };

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
  #_value: [number, number] = [0, 0] as const;
  #onValueChange?: (update: Update, instance: Slidytabs) => void;
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
  #onStateChange?: (index: number, instance: Slidytabs) => void;

  // constructor(root: HTMLElement, options: Options = {}) {
  constructor(root: HTMLElement) {
    this.#root = root;
    this.transitionDuration = defaultTransitionDuration;
    this.#extractFromDOM();
    this.#classes = categorizeClasses([...this.#trigger.classList]);
    safelistGeneralizedClasses(this.#trigger);
    this.#slidytab = this.#setupSlidytab();
    this.#onblur();
    this.#list.addEventListener("pointerdown", this.#onpointerdown);
    this.#list.addEventListener("pointerup", this.#onpointerup);
    this.#list.addEventListener("pointermove", this.#onpointermove);
    // this.#onValueChange =
    //   options.onValueChange ??
    //   (options.value === undefined
    //     ? (newValue) => (this.value = newValue)
    //     : undefined);
    this.#resizeObserver = this.#setupResizeObserver();
    this.#down = null;
    this.#setupFakeFocus();
    this.#isMoving = false;
    this.value =
      this.activeIndex >= 0 ? [this.activeIndex, this.activeIndex] : [0, 0];
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
    console.log(this.value, "const");
  }

  setOptions = ({
    value,
    onValueChange,
    onStateChange,
    swipe,
  }: {
    value?: NumberDuple;
    onValueChange?: (update: Update, instance: Slidytabs) => void;
    onStateChange?: (index: number, instance: Slidytabs) => void;
    swipe: boolean;
  }) => {
    console.log(value, "set");
    this.updateValue(value ?? [this.activeIndex, this.activeIndex]);
    this.#onValueChange = onValueChange;
    this.#onStateChange = onStateChange;
    this.#swipe = swipe;
    // this.#_value = value;
  };

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
    console.log("here");
    console.log(e);
    this.#extractFromDOM();
    // e.stopPropagation();
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    console.log(point);
    const trigger = document.elementFromPoint(...point)?.closest("button");
    console.log(trigger);
    // const trigger = (e.currentTarget as Element).closest("button");
    if (!trigger) {
      console.log("hi");
      return;
    }
    console.log(this.value);
    const index = this.#triggers.indexOf(trigger);
    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.#getEndpoints();
    this.#down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    this.#slidytab.style.transitionDuration = this.transitionDuration;
    const newValue = this.value.with(this.#down, index) as [number, number];
    console.log(newValue);
    // ? (this.value.with(this.#down, pressedIndex) as [number, number])
    // : pressedIndex;
    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    this.#onValueChange?.({ index, activeEdge: this.#down }, this);
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
    this.#triggers[index].click();
  };

  #onpointerup = () => {
    if (!this.#swipe) {
      return;
    }
    this.#slidytab.style.transitionDuration = this.transitionDuration;
    this.#down = null;
    this.#isMoving = false;
  };

  #onpointermove = (e: PointerEvent) => {
    if (!this.#swipe) {
      return;
    }
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
    const index = this.#triggers.indexOf(trigger);
    if (index < 0) {
      return;
    }

    // const newValue = Array.isArray(this.value)
    // const newValue = this.value.with(this.#down, i) as [number, number];
    // : i;

    // if (newValue[0] > newValue[1]) {
    //   console.log("sadfoi");
    //   return;
    // }
    this.#onValueChange?.({ index, activeEdge: this.#down }, this);

    this.#isMoving = true;
    this.#slidytab.style.transitionDuration = "0ms";
    // sync shadcn state with slidytabs state
    console.log(index, x);
    trigger.click();
    // focus trigger so keyboard events come from the correct trigger
    trigger.focus();
    // this.#onValueChange?.(newValue);
  };

  set value(newValue: [number, number]) {
    console.log(newValue, "set neval");
    this.#_value = newValue;
    if (this.value[0] > this.value[1]) {
      throw `${this.value[0]} is larger than ${this.value[1]}`;
    }
    for (let i = 0; i < this.#triggers.length; i++) {
      if (i >= this.value[0] && i <= this.value[1]) {
        this.#triggers[i].className = twMerge(
          this.#classes.base,
          this.#classes.activeText
        );
      } else {
        this.#triggers[i].className = twMerge(this.#classes.base);
      }
    }
    console.log(this.value, "qwer");
    const leftRect = this.#triggers[this.value[0]].getBoundingClientRect();
    const rightRect = this.#triggers[this.value[1]].getBoundingClientRect();
    const parentRect = this.#list.getBoundingClientRect();
    const left = `${leftRect.left - parentRect.left}px`;
    const top = `${leftRect.top - parentRect.top}px`;
    const bottom = `${parentRect.bottom - leftRect.bottom}px`;
    const right = `${parentRect.right - rightRect.right}px`;
    Object.assign(this.#slidytab.style, { left, top, bottom, right });
  }

  updateValue = (value: [number, number]) => {
    if (isEqual(value, this.value)) {
      return;
    }
    console.log("updating");
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
      // inset: "0",
    };
    Object.assign(slidytab.style, slidytabStyles);
    this.#list.style.position = "relative";
    // this.list.append(this.slidytab);
    return slidytab;
  };

  get value() {
    return this.#_value;
  }

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
    const callback = () => {
      this.#onStateChange?.(this.activeIndex, this);
    };
    const dataStateObserver = new MutationObserver(callback);
    // callback();
    dataStateObserver.observe(this.#list, {
      subtree: true,
      attributeFilter: ["data-state"],
    });
    return dataStateObserver;
  };

  destroyIfDisconnected() {
    // verify lifecycle stuff
    console.log("destroy?", this);

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
