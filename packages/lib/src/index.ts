import { Attachment } from "svelte/attachments";
import { twMerge } from "tailwind-merge";
import { setupIndicator } from "./util";
// import { escapeSelector as _escapeSelector } from "@unocss/core";

const transitionDuration = "125ms";

const triggersAddedStyles: Partial<CSSStyleDeclaration> = {
  backgroundColor: "transparent",
  background: "unset",
  boxShadow: "unset",
  filter: "unset",
  outlineColor: "transparent",
  borderColor: "transparent",
  zIndex: "10",
};

const slidyTabStyles = {
  transitionDuration,
  transitionProperty: "all",
  position: "absolute",
  height: "unset",
};

const focusSelector = ":focus-visible";
const focusPrefix = "focus-visible:";
const escapedFocusPrefix = "focus-visible\\:";

const activeSelector = '[data-state="active"]';
const activePrefix = "data-[state=active]:";
const escapedActivePrefix = "data-\\[state\\=active\\]\\:";

// can i use a regex to find selectors by ignorning \\s?

// not doing anything with the active-stripped styles just yet
// could remove them
// or extract the styles that get stripped

// TODOs
// Orientation check?
// Other parity behavior

const hasStyle = (el: Element): el is Element & ElementCSSInlineStyle =>
  "style" in el;

export const slidyTabs = (tabList: HTMLElement | null) => {
  if (!(tabList && tabList.children.length > 0 && hasStyle(tabList))) {
    return;
  }
  const triggers = [...tabList.children];
  const triggerFocusClasses = [...triggers[0].classList]
    // what does this line do
    .filter((item) => item.includes(focusPrefix))
    .map((item) => item.replace(focusPrefix, ""));
  const triggerBaseClasses = [...triggers[0].classList].filter(
    (item) => !item.includes(focusPrefix)
  );
  const onfocus = ({ currentTarget }: Event) => {
    if (
      !(
        currentTarget instanceof Element &&
        currentTarget.matches(":focus-visible")
      )
    ) {
      return;
    }
    slidyTab.classList = twMerge(
      [...triggerBaseClasses, ...triggerFocusClasses].join(" ")
    );
  };
  const onblur = () => {
    slidyTab.classList = [...triggerBaseClasses].join(" ");
  };
  triggers.forEach((item) => {
    if (hasStyle(item)) {
      Object.assign(item.style, triggersAddedStyles);
    }
    item.addEventListener("focus", onfocus);
    item.addEventListener("keydown", onfocus, true);
    item.addEventListener("blur", onblur);
  });

  const slidyTab = document.createElement("div");
  slidyTab.setAttribute("data-state", "active");
  Object.assign(slidyTab.style, slidyTabStyles);
  slidyTab.className = [...triggerBaseClasses].join(" ");
  tabList.append(slidyTab);
  tabList.style.position = "relative";

  const callback: MutationCallback = (mutationList) => {
    mutationList.map(({ target }) => target).forEach(syncTab);
  };

  const syncTab = (tab: Node) => {
    if (
      !(tab instanceof Element && tab.getAttribute("data-state") === "active")
    ) {
      return;
    }
    const childRect = tab.getBoundingClientRect();
    const parentRect = tabList.getBoundingClientRect();
    const left = childRect.left - parentRect.left;
    const top = childRect.top - parentRect.top;
    slidyTab.style.width = `${childRect.width}px`;
    slidyTab.style.height = `${childRect.height}px`;
    slidyTab.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  };

  const dataStateObserver = new MutationObserver(callback);
  dataStateObserver.observe(tabList, {
    subtree: true,
    attributeFilter: ["data-state"],
  });

  const resizeObserver = new ResizeObserver(() => {
    slidyTab.style.transitionDuration = "0ms";
    triggers.forEach(syncTab);
    requestAnimationFrame(() => {
      slidyTab.style.transitionDuration = transitionDuration;
    });
  });
  resizeObserver.observe(tabList);

  return () => {
    slidyTab.remove();
    dataStateObserver.disconnect();
    resizeObserver.disconnect();
    triggers.forEach((item) => {
      item.removeEventListener("focus", onfocus);
      item.removeEventListener("blur", onblur);
      item.removeEventListener("keydown", onfocus, true);
    });
  };
};

export const slidertabs: Attachment = (tablist) => {
  if (!(tablist instanceof HTMLElement)) {
    return;
  }
  let pointerDown = false;
  const onpointerdown = (e: PointerEvent) => {
    pointerDown = true;
    tablist.setPointerCapture(e.pointerId);
  };
  const onpointermove = (e: PointerEvent) => {
    if (!pointerDown) {
      return;
    }
    const { y, height } = tablist.getBoundingClientRect();
    document
      .elementFromPoint(e.clientX, y + height / 2)
      ?.closest("button")
      ?.click();
  };
  const onpointerup = () => {
    pointerDown = false;
  };
  tablist.addEventListener("pointerdown", onpointerdown);
  tablist.addEventListener("pointerup", onpointerup);
  tablist.addEventListener("pointermove", onpointermove);
  return () => {
    tablist.removeEventListener("pointerdown", onpointerdown);
    tablist.removeEventListener("pointerup", onpointerup);
    tablist.removeEventListener("pointermove", onpointermove);
  };
};

export const rangetabs =
  ({
    transitionDuration = 125,
    value: _value = () => 0,
    setValue,
  }: {
    transitionDuration?: number;
    value?: () => number | [number, number];
    setValue?: (value: number | [number, number]) => void;
  } = {}) =>
  (tablistElement: HTMLElement | null) => {
    if (!tablistElement) return;
    const value = _value();
    const range = Array.isArray(value) && value.length === 2;
    const triggerElements = [...tablistElement.querySelectorAll("button")];
    const fakeIndicatorElement = setupIndicator(tablistElement);
    let down: "left" | "right" | null = null;
    // const indices: [number, number] = [0, 10];

    // Remove active/bg styles from individual triggers
    // But maintain active/fg styles
    triggerElements.forEach((item) => {
      Object.assign(item.style, triggersAddedStyles);
    });
    const onpointerdown = (e: PointerEvent) => {
      const trigger = e.target;
      if (!(trigger instanceof HTMLButtonElement)) {
        return;
      }

      const tabListX = getCurrentTargetX(e);
      let leftRect, rightRect;
      if (range) {
        const values = value as [number, number];
        const xCoords = getXCoords(triggerElements, values);
        down =
          // e.clientX < xCoords[0] ||
          // tabListX < xCoords[0] ||
          Math.abs(tabListX - xCoords[0]) < Math.abs(tabListX - xCoords[1])
            ? "left"
            : "right";
        values[down === "left" ? 0 : 1] = triggerElements.indexOf(trigger);
        setValue?.([...values]);
        leftRect = triggerElements[values[0]].getBoundingClientRect();
        rightRect = triggerElements[values[1]].getBoundingClientRect();
      } else {
        const value = triggerElements.indexOf(trigger);
        setValue?.(value);
        leftRect = rightRect = triggerElements[value].getBoundingClientRect();
      }
      // STYLE slidytab to match indices

      const parentRect = tablistElement.getBoundingClientRect();

      Object.assign(fakeIndicatorElement.style, {
        left: `${leftRect.left - parentRect.left}px`,
        top: `${leftRect.top - parentRect.top}px`,
        bottom: `${parentRect.bottom - leftRect.bottom}px`,
        right: `${parentRect.right - rightRect.right}px`,
      });

      // tablist.setPointerCapture(e.pointerId);
    };
    tablistElement.addEventListener("pointerdown", onpointerdown);
    return () => {
      fakeIndicatorElement.remove();
    };
  };

const getXCoords = (triggers: HTMLElement[], [x0, x1]: [number, number]) => {
  return [
    triggers[x0].offsetLeft + triggers[x0].offsetWidth,
    triggers[x1].offsetLeft,
  ];
};

// FUNCTIONS SHOULD DO ONE THING

const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

interface SlidyTabProps {
  slider?:
    | true
    | [number, (value: number) => void]
    | [[number, number], (values: [number, number]) => void];
}

// const slidyTabs: (props: SlidyTabProps) => Attachment<HTMLElement> =
//   ({ slider }) =>
//   (tablistElement) => {

//   };

// draggable
//

// export const tabs = () => (tablist: HTMLElement | null) => {
//   if (!tablist) {
//     return;
//   }
//   const activeIndex = getActiveIndex(tablist);
//   console.log(activeIndex);

//   removeActiveStyles(tablist);
// };

// const removeActiveStyles = (tablist: HTMLElement) => {
//   const triggers = getTriggers(tablist);
//   triggers.forEach((item) => {
//     Object.assign(item.style, triggersAddedStyles);
//   });
// };

// const getTriggers = (tablist: HTMLElement) => {
//   return [...tablist.querySelectorAll("button")];
// };

interface SlidytabOptions {
  value?: number | [number, number];
  transitionDuration?: number;
  onValueChange?: () => void;
  swipe?: boolean;
}

export const slidytabs =
  (options: SlidytabOptions = { transitionDuration: 125, swipe: false }) =>
  (tablist: HTMLElement | null) => {
    if (tablist === null) {
      return;
      // could be a ref unmounting??
      // in which case st.cleanup() but ...
      //  "if you pass an inline arrow as a ref, it'll go through unset / set cycle on every render"
    }
    let st: Slidytabs;
    // if (!state) {
    st = new Slidytabs(tablist, options);
    // }
    // if (value) {
    //   st.setValue(value);
    //   console.log("setting vlaue");
    // }
    return () => st.cleanup();
  };

class Slidytabs {
  private root;
  private list;
  private triggers;
  private trigger;
  private slidytab;
  private value: [number, number] | number;

  constructor(root: HTMLElement, options: SlidytabOptions = {}) {
    this.root = root;
    this.triggers = [...this.root.querySelectorAll("button")];
    this.trigger = this.triggers[0];
    const list = this.trigger.parentElement;
    if (!list) {
      throw "no list";
    }
    this.list = list;
    this.removeActiveStyles();
    const slidytab = list.querySelector<HTMLDivElement>("div[slidytab]");
    this.slidytab = slidytab || this.setupSlidytab();
    list.addEventListener("pointerdown", this.onpointerdown);
    if (options.value) {
      this.value = options.value;
      this.setValue(options.value);
    } else {
      this.value = this.activeIndex;
      this.setValue(this.activeIndex);
    }
    this.setupResizeObserver();
  }

  private removeActiveStyles = () => {
    for (const trigger of this.triggers) {
      Object.assign(trigger.style, triggersAddedStyles);
    }
  };

  private onpointerdown = (e: PointerEvent) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      return;
    }
    // explain this
    const pressedIndex = this.triggers.indexOf(e.target);
    const tabListX = this.getCurrentTargetX(e);
    const xCoords = this.getXCoords();
    const down =
      Math.abs(tabListX - xCoords[0]) < Math.abs(tabListX - xCoords[1])
        ? "left"
        : "right";
    this.setValue(
      !Array.isArray(this.value)
        ? pressedIndex
        : down === "left"
        ? [pressedIndex, this.value[1]]
        : [this.value[0], pressedIndex]
    );
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
      transitionDuration,
      transitionProperty: "all",
      position: "absolute",
      height: "unset",
      // marginRight: "3px",
      // width: "",
    };
    Object.assign(this.slidytab.style, slidytabStyles);
    const triggerBaseClasses = this.trigger.classList;
    this.list.style.position = "relative";
    this.slidytab.setAttribute("data-state", "active");
    this.slidytab.className = [...triggerBaseClasses].join(" ");
    this.list.append(this.slidytab);
    return this.slidytab;
  };

  setValue = (value: number | [number, number]) => {
    this.value = value;
    console.log(value);
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
      this.slidytab.style.transitionDuration = transitionDuration;
    });
    resizeObserver.observe(this.list);
  };

  getXCoords = () => {
    const [x0, x1] = this.valueDuple;
    return [
      this.triggers[x0].offsetLeft,
      this.triggers[x1].offsetLeft + this.triggers[x1].offsetWidth,
    ];
  };

  getCurrentTargetX = (e: PointerEvent) =>
    e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

  cleanup() {}
}
