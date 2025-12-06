import { twMerge } from "tailwind-merge";

type ValueType = number | [number, number];
type SlidyOptions = BaseOptions<number>;
type RangeOptions = BaseOptions<[number, number]>;

interface BaseOptions<T extends ValueType> {
  value?: T;
  transitionDuration?: number;
  onValueChange?: (value: T) => void;
  swipe?: boolean;
}

const defaultTransitionDuration = 1500;
const instances = new WeakMap<HTMLElement, Slidytabs>();

export const slidytabs =
  (options: SlidyOptions = {}) =>
  (tabroot: HTMLElement | null) => {
    if (tabroot === null) {
      return;
    }
    let instance = instances.get(tabroot);
    if (!instance) {
      instance = new Slidytabs(tabroot, {
        transitionDuration: defaultTransitionDuration,
        swipe: true,
        ...options,
      } as BaseOptions<ValueType>);
      instances.set(tabroot, instance);
    } else if (options.value != null) {
      instance.setValue(options.value);
    }
  };

export const rangetabs =
  (options: RangeOptions = {}) =>
  (tabroot: HTMLElement | null) => {
    if (tabroot === null) {
      return;
    }
    let instance = instances.get(tabroot);
    if (!instance) {
      instance = new Slidytabs(tabroot, {
        transitionDuration: defaultTransitionDuration,
        swipe: true,
        ...options,
      } as BaseOptions<ValueType>);
      instances.set(tabroot, instance);
    } else if (options.value != null) {
      instance.setValue(options.value);
    }
  };

class Slidytabs {
  private root;
  private list;
  private triggers;
  private trigger;
  private slidytab;
  private value: ValueType;
  private onValueChange?: (value: ValueType) => void;
  private resizeObserver;
  private dataStateObserver;
  private down: number | null;
  private classes;
  private _transitionDuration;

  constructor(root: HTMLElement, options: BaseOptions<ValueType> = {}) {
    // can we mess with stylesheets just once or could new styles get loaded
    // that we miss if we only process them on file load
    console.log("new instance!");
    this.root = root;
    this.triggers = [...this.root.querySelectorAll("button")];
    this.trigger = this.triggers[0];
    this._transitionDuration = options.transitionDuration;
    const list = this.trigger.parentElement;
    if (!list) {
      throw "no list";
    }
    this.list = list;
    this.classes = this.categorizeClasses([...this.trigger.classList]);
    this.setTriggerStyles();
    this.slidytab = this.setupSlidytab();
    list.addEventListener("pointerdown", this.onpointerdown);
    list.addEventListener("pointerup", this.onpointerup);
    if (options.swipe) {
      list.addEventListener("pointermove", this.onpointermove);
    }
    this.onValueChange = options.onValueChange;
    if (options.value != null) {
      this.value = options.value;
      this.setValue(options.value);
    } else {
      this.value = this.activeIndex;
      this.setValue(this.activeIndex);
    }
    this.resizeObserver = this.setupResizeObserver();
    this.dataStateObserver = this.setupDataStateObserver();
    this.down = null;
    this.setupFakeFocus();
  }

  private categorizeClasses = (classList: string[]) => {
    const textClasses =
      /^(text|font|color|tracking|leading|decoration|underline|line-through|overline|uppcase|lowercase|capitalize)/;
    const activeVariant = "data-[state=active]:";
    const focusVariant = "focus-visible:";
    const active = classList
      .filter((item) => item.includes(activeVariant))
      .map((item) => item.replace(activeVariant, ""));
    const focus = classList
      .filter((item) => item.includes(focusVariant))
      .map((item) => item.replace(focusVariant, ""));
    const base = classList.filter(
      (item) => !(item.includes(focusVariant) || item.includes(activeVariant))
    );
    const activeText = active.filter((item) => item.match(textClasses));
    const activeIndicator = active.filter((item) => !item.match(textClasses));
    const focusText = focus.filter((item) => item.match(textClasses));
    const focusIndicator = focus.filter((item) => !item.match(textClasses));
    return { activeText, activeIndicator, focusText, focusIndicator, base };
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

  private onpointerdown = (e: PointerEvent) => {
    console.log("down");
    const button = (e.target as Element).closest("button");
    if (!button) {
      return;
    }
    const pressedIndex = this.triggers.indexOf(button);
    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.getEndpoints();
    this.down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    const newValue = Array.isArray(this.value)
      ? (this.value.with(this.down, pressedIndex) as [number, number])
      : pressedIndex;
    // should consolidate this as it is exactly the same in
    // onpointermove
    if (Array.isArray(newValue) && newValue[0] > newValue[1]) {
      return;
    }
    this.setValue(newValue);
    this.onValueChange?.(newValue);
    this.list.setPointerCapture(e.pointerId);
  };

  private get transitionDuration() {
    return `${this._transitionDuration}ms`;
  }

  private onpointerup = () => {
    this.slidytab.style.transitionDuration = this.transitionDuration;
    this.down = null;
  };

  private onpointermove = async (e: PointerEvent) => {
    console.log("Moving");
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
    this.slidytab.style.transitionDuration = "0ms";
    trigger.click();
    this.setValue(newValue);
    this.onValueChange?.(newValue);
  };

  get activeIndex() {
    const activeElement = this.root.querySelector<HTMLButtonElement>(
      "button[data-state=active]"
    );
    if (!activeElement) {
      return -1;
    }
    return this.triggers.indexOf(activeElement);
  }

  private setupSlidytab = (): HTMLDivElement => {
    this.slidytab = document.createElement("div");
    this.slidytab.setAttribute("slidytab", "");
    const slidytabStyles: Partial<CSSStyleDeclaration> = {
      transitionDuration: this.transitionDuration,
      transitionProperty: "all",
      position: "absolute",
      height: "unset",
      // outlineColor: "unset",
      outlineColor: "transparent",
    };
    Object.assign(this.slidytab.style, slidytabStyles);
    this.slidytab.className = twMerge(
      this.classes.base,
      this.classes.activeIndicator
    );
    this.list.style.position = "relative";
    this.list.append(this.slidytab);
    return this.slidytab;
  };

  setValue = async (value: ValueType, animate: boolean) => {
    this.value = value;
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
    // wait till after the framework has updated data-state
    // await new Promise(requestAnimationFrame);
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
  };

  get valueDuple() {
    return Array.isArray(this.value) ? this.value : [this.value, this.value];
  }

  setupResizeObserver = () => {
    const resizeObserver = new ResizeObserver(async () => {
      // we want instant adjustments, so temporarily remove transition
      this.slidytab.style.transitionDuration = "0ms";
      this.setValue(this.value);
      await new Promise(requestAnimationFrame);
      this.slidytab.style.transitionDuration = this.transitionDuration;
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
        this.setValue(this.activeIndex);
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
    // this.list.removeEventListener("pointermove", this.onpointermove);
    this.resizeObserver.disconnect();
    this.dataStateObserver.disconnect();
    for (const trigger of this.triggers) {
      trigger.removeEventListener("focus", this.onfocus);
      trigger.removeEventListener("blur", this.onblur);
      trigger.removeEventListener("keydown", this.onfocus, true);
    }
  }
}

const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

const safelistGeneralizedClasses = () => {
  const focusSelector = ":focus-visible";
  const escapedFocusPrefix = "focus-visible\\:";
  const activeSelector = '[data-state="active"]';
  const escapedActivePrefix = "data-\\[state\\=active\\]\\:";

  if (typeof document !== "undefined") {
    [...document.styleSheets].forEach((styleSheet) => {
      [...styleSheet.cssRules]
        .filter(
          (item) =>
            // for firefox
            item instanceof CSSStyleRule &&
            ![focusSelector, activeSelector].includes(
              item.selectorText.trim()
            ) &&
            (item.selectorText.includes(focusSelector) ||
              item.selectorText.includes(activeSelector))
        )
        .forEach(({ cssText }) => {
          const newRule = cssText
            .replaceAll(escapedFocusPrefix, "")
            .replaceAll(focusSelector, "")
            .replaceAll(escapedActivePrefix, "")
            .replaceAll(activeSelector, "");
          styleSheet.insertRule(newRule);
        });
    });
  }
};

safelistGeneralizedClasses();
