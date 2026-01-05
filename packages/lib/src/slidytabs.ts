import { twMerge } from "tailwind-merge";
import {
  categorizeClasses,
  safelistGeneralizedClasses,
  getCurrentTargetX,
} from "./util.js";

const defaultTransitionDuration = 0.2 * 1000;
// const defaultTransitionDuration = 1500;

type ClickSource = "shadcn" | "slidytabs";
export const instances = new WeakMap<HTMLElement, Slidytabs>();
export type RangeValue = [start: number, end: number];
export interface SlidytabsOptions {
  value?: RangeValue;
  onValueChange?: (update: Update, instance: Slidytabs) => void;
  swipe: boolean;
  push: boolean;
  source: ClickSource;
}
export interface Update {
  activeEdge: number | null;
  index: number;
  value: RangeValue;
}

export class Slidytabs {
  #source!: ClickSource;
  #push = false;
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
  #slideToken = false;
  #lastTriggered: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#extractFromDOM();
    this.#classes = categorizeClasses(this.#triggers);
    for (const trigger of this.#triggers) {
      safelistGeneralizedClasses(trigger);
    }
    this.#slidytab = this.#setupSlidytab();
    this.#list.addEventListener("mousedown", this.#stopPropagation, true);
    this.#list.addEventListener("click", this.#stopPropagation, true);
    this.#list.addEventListener("focus", this.#onfocus, true);
    this.#list.addEventListener("pointerdown", this.#onpointerdown, true);
    this.#list.addEventListener("pointerup", this.#onpointerup);
    this.#list.addEventListener("pointermove", this.#onpointermove, true);
    this.#resizeObserver = this.#setupResizeObserver();
    const triggerStyles: Partial<CSSStyleDeclaration> = {
      zIndex: "10",
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
    push,
    source,
  }: SlidytabsOptions) => {
    this.#onValueChange = onValueChange;
    this.#swipe = swipe;
    this.#push = push;
    this.#source = source;
    if (!value) {
      onValueChange?.(
        {
          index: this.activeIndex,
          activeEdge: null,
          value: [this.activeIndex, this.activeIndex],
        },
        this
      );
    } else {
      this.updateValue(value);
    }
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

  #onfocus = (e: FocusEvent) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      return;
    }
    if (this.#source === "shadcn") {
      return;
    }
    const index = this.#triggers.indexOf(e.target);
    // e.stopPropagation();
    // e.preventDefault();
    this.#onValueChange?.(
      {
        index,
        activeEdge: this.down,
        // trigger: e.target,
        value: this.value,
      },
      this
    );
  };

  #stopPropagation = (e: MouseEvent) => {
    if (this.#source === "shadcn") {
      return;
    }
    e.stopPropagation();
  };

  #onpointerdown = async (e: PointerEvent) => {
    this.#slideToken = true;
    // must be a better place for this if we really care
    // mutation observer?
    this.#extractFromDOM();
    const { index, trigger } = this.#triggerFromEvent(e);
    if (index === undefined) {
      return;
    }
    const tabListX = getCurrentTargetX(e);
    const [x0, x1] = this.#getEndpoints();
    // TODO test out vertical range
    this.down = Math.abs(tabListX - x0) < Math.abs(tabListX - x1) ? 0 : 1;
    // keep getting events when pointer leaves tabs:
    this.#list.setPointerCapture(e.pointerId);
    if (this.#source === "shadcn") {
      return;
    }
    this.#onValueChange?.(
      {
        index,
        activeEdge: this.down,
        value: this.value,
      },
      this
    );
  };

  #onpointerup = () => {
    // this.down = null;
  };

  #triggerFromEvent = (e: PointerEvent) => {
    const { x, y, width, height } = this.#list.getBoundingClientRect();
    const point = {
      horizontal: [e.clientX, y + height / 2] as const,
      vertical: [x + width / 2, e.clientY] as const,
    }[this.#orientation];
    const button = document.elementFromPoint(...point)?.closest("button");
    if (button) {
      const index = this.#triggers.indexOf(button);
      return { index, trigger: button };
    }
    // clamp in case events aren't firing as quickly as the user is moving
    const trigger = {
      horizontal:
        e.clientX > x + width / 2
          ? this.#triggers[this.#triggers.length - 1]
          : this.#triggers[0],
      vertical:
        e.clientY > y + height / 2
          ? this.#triggers[this.#triggers.length - 1]
          : this.#triggers[0],
    }[this.#orientation];
    const index = this.#triggers.indexOf(trigger);
    return { index, trigger };
  };

  #onpointermove = (e: PointerEvent) => {
    if (e.buttons === 0) {
      this.down = null;
    }
    const { trigger, index } = this.#triggerFromEvent(e);
    if (
      !this.#swipe ||
      this.down === null ||
      (((this.down === 0 && index > this.value[1]) ||
        (this.down === 1 && index < this.value[0])) &&
        !this.#push)
    ) {
      return;
    }
    if (this.#source === "slidytabs") {
      this.#onValueChange?.(
        {
          index,
          activeEdge: this.down,
          value: this.value,
        },
        this
      );
    } else {
      trigger.focus();
    }
  };

  updateValue = (value: RangeValue) => {
    if (
      this.value &&
      value[0] === this.value[0] &&
      value[1] === this.value[1]
    ) {
      return;
    }

    if (value[0] > value[1] && !this.#push) {
      return;
    }
    let adjustedValue = value;
    if (value[0] > value[1] && this.#push && this.down !== null) {
      adjustedValue = value.with(
        (this.down + 1) % 2,
        value[this.down]
      ) as RangeValue;
    }
    this.#slidytab.style.transitionDuration =
      this.down !== null && this.#slideToken ? this.transitionDuration : "0ms";
    this.value = adjustedValue;
    this.#slideToken = false;
    this.#updateTriggersUI();
    this.#updateIndicatorUI();
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

  #updateTriggersUI = async () => {
    // focus goes to wrong component without this
    this.#list.tabIndex = -1;
    this.#dataStateObserver.disconnect();
    await new Promise(requestAnimationFrame);
    for (let i = 0; i < this.#triggers.length; i++) {
      const inRange = i >= this.value[0] && i <= this.value[1];
      const targetState = inRange ? "active" : "inactive";
      const trigger = this.#triggers[i];
      // trigger.tabIndex = this.value.includes(i) ? 0 : -1;
      if (this.value.includes(i)) {
        // trigger.focus();
        // trigger.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
        // trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        // trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }

      if (trigger.dataset.state !== targetState) {
        // trigger.tabIndex = targetState === "active" ? 0 : 1;
        trigger.dataset.state = targetState;
      }
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

  #tabSolo = (index: number) => {
    for (let i = 0; i < this.#triggers.length; i++) {
      if (i !== index) {
        this.#triggers[i].tabIndex = -1;
      }
    }
  };

  #setupDataStateObserver = () => {
    const dataStateObserver = new MutationObserver(
      async (mutationList: MutationRecord[]) => {
        if (this.#source === "slidytabs") {
          return;
        }
        for (const observation of mutationList) {
          if (
            observation.target instanceof HTMLButtonElement &&
            observation.target.dataset.state === "active"
          ) {
            const index = this.#triggers.indexOf(observation.target);
            this.#slidytab.className = twMerge(
              this.#classes[this.value?.[index] ?? 0].base,
              this.#classes[this.value?.[index] ?? 0].activeIndicator
            );
            this.#onValueChange?.(
              {
                index,
                activeEdge: this.down,
                value: this.value,
              },
              this
            );
          }
        }
        this.#updateTriggersUI();
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
    // this.#dataStateObserver?.disconnect();
    instances.delete(this.#root);
  }
}

// if (typeof window !== "undefined" && typeof document !== "undefined") {
//   document.addEventListener("focusin", (e) => {
//     const el = e.target;
//     console.log("FOCUS →", el.tagName, el.getAttribute("role"), el.tabIndex);
//   });
// }

// const orig = HTMLElement.prototype.focus;
// HTMLElement.prototype.focus = function () {
//   console.trace("focus() called on", this);
//   return orig.apply(this);
// };
