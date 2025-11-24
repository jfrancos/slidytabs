import { Attachment } from "svelte/attachments";
import { twMerge } from "tailwind-merge";

const transitionDuration = "125ms";

const triggersAddedStyles = {
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
  // inset: 0,
};

const focusSelector = ":focus-visible";
const focusPrefix = "focus-visible:";
const escapedFocusPrefix = "focus-visible\\:";

const activeSelector = '[data-state="active"]';
// const activePrefix = "data-[state=active]:";
const escapedActivePrefix = "data-\\[state\\=active\\]\\:";

// not doing anything with the active-stripped styles just yet
// could remove them
// or extract the styles that get stripped
if (typeof document !== "undefined") {
  [...document.styleSheets].forEach((styleSheet) => {
    [...styleSheet.cssRules]
      .filter(
        (item) =>
          item instanceof CSSStyleRule &&
          // for firefox
          ![focusSelector, activeSelector].includes(item.selectorText.trim()) &&
          (item.selectorText.includes(focusSelector) ||
            item.selectorText.includes(activeSelector))
      )
      .forEach(({ cssText }) => {
        styleSheet.insertRule(
          cssText
            .replace(escapedFocusPrefix, "")
            .replace(focusSelector, "")
            .replace(escapedActivePrefix, "")
            .replace(activeSelector, "")
        );
      });
  });
}

// TODOs
// Orientation check?
// Other parity behavior

const hasStyle = (el: Element): el is Element & ElementCSSInlineStyle =>
  "style" in el;

export const slidytabs: Attachment = (tabList) => {
  if (!(tabList.children.length > 0 && hasStyle(tabList))) {
    return;
  }
  const triggers = [...tabList.children];
  const triggerFocusClasses = [...triggers[0].classList]
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
  } = {}): Attachment<HTMLElement> =>
  (tablistElement) => {
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
    console.log("asdf");
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

const setupIndicator = (tablistElement: HTMLElement) => {
  const triggerElements = [...tablistElement.querySelectorAll("button")];
  const triggerBaseClasses = [...triggerElements[0].classList].filter(
    (item) => !item.includes(focusPrefix)
  );
  tablistElement.style.position = "relative";
  const fakeIndicatorElement = document.createElement("div");
  Object.assign(fakeIndicatorElement.style, slidyTabStyles);
  fakeIndicatorElement.setAttribute("data-state", "active");
  fakeIndicatorElement.className = [...triggerBaseClasses].join(" ");
  tablistElement.append(fakeIndicatorElement);
  return fakeIndicatorElement;
};

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

console.log("hi");
