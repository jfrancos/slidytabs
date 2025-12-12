import { twMerge } from "tailwind-merge";
import { isEqual } from "radashi";
import { categorizeClasses, safelistGeneralizedClasses } from "./util";

type ValueType = number | [number, number];
type SlidyOptions = BaseOptions<number>;
type RangeOptions = BaseOptions<[number, number]>;

interface BaseOptions<T extends ValueType> {
  value?: T;
  transitionDuration?: number;
  onValueChange?: (value: T) => void;
  swipe?: boolean;
}

const defaultTransitionDuration = 1200;
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
  private root;
  private list;
  private triggers;
  private trigger;
  private slidytab!: HTMLDivElement;
  private _value: ValueType = 0;
  private onValueChange?: (value: ValueType) => void;
  private resizeObserver;
  private dataStateObserver;
  private down: number | null;
  private classes;
  private _transitionDuration = defaultTransitionDuration;
  private controlled;
  private isMoving;

  constructor(root: HTMLElement, options: BaseOptions<ValueType> = {}) {
    this.root = root;
    this.triggers = [...this.root.querySelectorAll("button")];
    this.trigger = this.triggers[0];
    this.transitionDuration =
      options.transitionDuration || defaultTransitionDuration;
    const list = this.trigger.parentElement;
    if (!list) {
      throw "no list";
    }
    this.list = list;
    this.classes = categorizeClasses([...this.trigger.classList]);
    safelistGeneralizedClasses(this.trigger);
    this.setTriggerStyles();
    this.setupSlidytab();
    list.addEventListener("pointerdown", this.onpointerdown);
    list.addEventListener("pointerup", this.onpointerup);
    if (options.swipe) {
      list.addEventListener("pointermove", this.onpointermove);
    }
    this.onValueChange = options.onValueChange;
    this.value = options.value ?? this.activeIndex;
    this.controlled = options.value !== undefined;
    this.resizeObserver = this.setupResizeObserver();
    if (!this.controlled) {
      this.dataStateObserver = this.setupDataStateObserver();
    }
    this.down = null;
    this.setupFakeFocus();
    this.isMoving = false;
  }

  private onpointerdown = (e: PointerEvent) => {
    const button = (e.target as Element).closest("button");
    if (!button) {
      return;
    }
    const pressedIndex = this.triggers.indexOf(button);
    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.getEndpoints();
    const { orientation } = this.root.dataset;

    const { x, y, width, height } = this.list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[orientation!];
    const trigger = document.elementFromPoint(...point!)?.closest("button");

    this.down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    this.slidytab.style.transitionDuration = this.transitionDuration;
    const newValue = Array.isArray(this.value)
      ? (this.value.with(this.down, pressedIndex) as [number, number])
      : pressedIndex;
    // should consolidate this as it is exactly the same in
    // onpointermove
    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    if (!this.controlled) {
      this.value = newValue;
    }
    this.onValueChange?.(newValue);
    // keep getting events when pointer leaves tabs:
    this.list.setPointerCapture(e.pointerId);
    this.triggers[pressedIndex].click();
  };

  private onpointerup = () => {
    this.slidytab.style.transitionDuration = this.transitionDuration;
    this.down = null;
    this.isMoving = false;
  };

  private onpointermove = (e: PointerEvent) => {
    if (e.buttons === 0) {
      this.onpointerup();
    }
    const { orientation } = this.root.dataset;
    if (
      this.down === null ||
      !(orientation === "horizontal" || orientation === "vertical")
    ) {
      return;
    }
    const { x, y, width, height } = this.list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[orientation];
    const trigger = document.elementFromPoint(...point)?.closest("button");
    if (!trigger) {
      return;
    }
    const i = this.triggers.indexOf(trigger);
    if (i < 0) {
      return;
    }

    const newValue = Array.isArray(this.value)
      ? (this.value.with(this.down, i) as [number, number])
      : i;

    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    this.isMoving = true;
    this.slidytab.style.transitionDuration = "0ms";
    // sync shadcn state with slidytabs state
    trigger.click();
    // focus trigger so keyboard events come from the correct trigger
    trigger.focus();
    if (!this.controlled) {
      this.value = newValue;
    }
    this.onValueChange?.(newValue);
  };

  set value(newValue: ValueType) {
    this._value = newValue;
    if (this.valueDuple[0] > this.valueDuple[1]) {
      throw `${this.valueDuple[0]} is larger than ${this.valueDuple[1]}`;
    }
    const leftRect = this.triggers[this.valueDuple[0]].getBoundingClientRect();
    const rightRect = this.triggers[this.valueDuple[1]].getBoundingClientRect();
    const parentRect = this.list.getBoundingClientRect();
    Object.assign(this.slidytab.style, {
      left: `${leftRect.left - parentRect.left}px`,
      top: `${leftRect.top - parentRect.top}px`,
      bottom: `${parentRect.bottom - leftRect.bottom}px`,
      right: `${parentRect.right - rightRect.right}px`,
    });
    for (let i = 0; i < this.triggers.length; i++) {
      if (i >= this.valueDuple[0] && i <= this.valueDuple[1]) {
        this.triggers[i].className = twMerge(
          this.classes.base,
          this.classes.activeText
        );
      } else {
        this.triggers[i].className = this.classes.base.join(" ");
      }
    }
  }

  updateValue = async (value: ValueType) => {
    if (isEqual(value, this.value)) {
      return;
    }
    if (this.isIncremental(value) && (this.down === null || this.isMoving)) {
      this.slidytab.style.transitionDuration = "0ms";
      this.value = value;
    } else {
      this.slidytab.style.transitionDuration = this.transitionDuration;
      this.value = value;
    }
  };

  private onfocus = ({ currentTarget }: Event) => {
    if (
      !(
        currentTarget instanceof Element &&
        currentTarget.matches(":focus-visible")
      )
    ) {
      return;
    }
    this.slidytab.className = twMerge(
      this.classes.base,
      this.classes.activeIndicator,
      this.classes.focusIndicator
    );
  };

  private onblur = () => {
    this.slidytab.className = twMerge(
      this.classes.base,
      this.classes.activeIndicator
    );
  };

  private setupFakeFocus = () => {
    for (const trigger of this.triggers) {
      trigger.addEventListener("focus", this.onfocus);
      trigger.addEventListener("blur", this.onblur);
      trigger.addEventListener("keydown", this.onfocus, true);
    }
  };

  private setTriggerStyles = () => {
    const triggerStyles: Partial<CSSStyleDeclaration> = {
      zIndex: "10",
      touchAction: "none",
      outline: "unset",
    };
    for (const trigger of this.triggers) {
      Object.assign(trigger.style, triggerStyles);
    }
  };

  get transitionDuration(): string {
    return `${this._transitionDuration}ms`;
  }

  set transitionDuration(duration: number) {
    this._transitionDuration = duration;
  }

  get activeIndex() {
    const activeElement = this.root.querySelector<HTMLButtonElement>(
      "button[data-state=active]"
    );
    if (!activeElement) {
      return -1;
    }
    return this.triggers.indexOf(activeElement);
  }

  private setupSlidytab = () => {
    this.slidytab = document.createElement("div");
    this.slidytab.setAttribute("slidytab", "");
    const slidytabStyles: Partial<CSSStyleDeclaration> = {
      transitionDuration: this.transitionDuration,
      transitionProperty: "all",
      position: "absolute",
      height: "unset",
      outlineColor: "transparent",
    };
    Object.assign(this.slidytab.style, slidytabStyles);
    this.slidytab.className = twMerge(
      this.classes.base,
      this.classes.activeIndicator
    );
    this.list.style.position = "relative";
    this.list.append(this.slidytab);
  };

  get value() {
    return this._value;
  }

  get valueDuple() {
    return Array.isArray(this.value) ? this.value : [this.value, this.value];
  }

  isIncremental = (value: ValueType) => {
    if (Array.isArray(value) && Array.isArray(this.value)) {
      return (
        Math.abs(value[0] - this.valueDuple[0]) <= 1 &&
        Math.abs(value[1] - this.valueDuple[1]) <= 1
      );
    } else {
      return Math.abs((value as number) - (this.value as number)) <= 1;
    }
  };

  private setupResizeObserver = () => {
    const resizeObserver = new ResizeObserver(async () => {
      this.slidytab.style.transitionDuration = "0ms";
      this.value = this.value;
    });
    resizeObserver.observe(this.list);
    return resizeObserver;
  };

  getEndpoints = () => {
    const [x0, x1] = this.valueDuple;
    return [
      this.triggers[x0].offsetLeft,
      this.triggers[x1].offsetLeft + this.triggers[x1].offsetWidth,
    ];
  };

  setupDataStateObserver = () => {
    // this works but messses with controlled component
    const dataStateObserver = new MutationObserver(() => {
      if (this.value !== this.activeIndex && !Array.isArray(this.value)) {
        this.value = this.activeIndex;
        this.onValueChange?.(this.value);
      }
    });
    dataStateObserver.observe(this.list, {
      subtree: true,
      attributeFilter: ["data-state"],
    });
    return dataStateObserver;
  };

  destroy() {
    this.list.removeEventListener("pointerdown", this.onpointerdown);
    this.list.removeEventListener("pointermove", this.onpointermove);
    this.resizeObserver.disconnect();
    this.dataStateObserver?.disconnect();
    for (const trigger of this.triggers) {
      trigger.removeEventListener("focus", this.onfocus);
      trigger.removeEventListener("blur", this.onblur);
      trigger.removeEventListener("keydown", this.onfocus, true);
    }
  }
}

const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

if (typeof document !== "undefined" && !(globalThis as any).sheet) {
  const sheet = new CSSStyleSheet();
  (globalThis as any).sheet = sheet;
  document.adoptedStyleSheets.push(sheet);
}
