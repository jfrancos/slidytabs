import { Attachment } from "svelte/attachments";
import { twMerge } from "tailwind-merge";

const transitionDuration = "250ms";

const triggersAddedStyles = {
  backgroundColor: "transparent",
  background: "unset",
  boxShadow: "unset",
  filter: "unset",
  outlineColor: "transparent",
  borderColor: "transparent",
  zIndex: "10",
  // pointerEvents: "none",
  // cursor: "pointer",
};

const slidyTabStyles = {
  transitionDuration,
  transitionProperty: "all",
  position: "absolute",
  height: "unset",
  // inset: 0,
  // pointerEvents: "none",
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

const getTriggerForX = (tablist: HTMLElement, x: number) => {
  const { y, height } = tablist.getBoundingClientRect();
  // console.log(y, height, x);
  return document.elementFromPoint(x, y + height / 2)?.closest("button");
  // ?.click();
};

export const rangetabs: Attachment = (tablist) => {
  if (!(tablist instanceof HTMLElement)) {
    return;
  }
  const triggers = [...tablist.children].filter(
    (item) => item instanceof HTMLElement
  );
  const triggerFocusClasses = [...triggers[0].classList]
    .filter((item) => item.includes(focusPrefix))
    .map((item) => item.replace(focusPrefix, ""));
  const triggerBaseClasses = [...triggers[0].classList].filter(
    (item) => !item.includes(focusPrefix)
  );
  const slidyTab = document.createElement("div");
  tablist.append(slidyTab);
  tablist.style.position = "relative";
  slidyTab.setAttribute("data-state", "active");
  Object.assign(slidyTab.style, slidyTabStyles);
  slidyTab.className = [...triggerBaseClasses].join(" ");

  let down: "left" | "right" | null = null;
  const indices: [number, number] = [0, 12];

  triggers.forEach((item) => {
    if (hasStyle(item)) {
      Object.assign(item.style, triggersAddedStyles);
    }
  });
  const onpointerdown = (e: PointerEvent) => {
    const currentTargetX = getCurrentTargetX(e);
    const xCoords = getXCoords(triggers, indices);
    down =
      Math.abs(currentTargetX - xCoords[0]) <
        Math.abs(currentTargetX - xCoords[1]) || e.clientX < xCoords[0]
        ? "left"
        : "right";
    // console.log(down);
    // console.log(e);
    // const trigger = getTriggerForX(tablist, e.clientX);
    const trigger = e.target;

    if (!trigger || !(trigger instanceof HTMLElement)) {
      console.log("no trigger");
      return;
    }
    indices[down === "left" ? 0 : 1] = triggers.indexOf(trigger);
    // console.log(indices);
    // STYLE slidytab to match indices
    const leftRect = triggers[indices[0]].getBoundingClientRect();
    const rightRect = triggers[indices[1]].getBoundingClientRect();
    const parentRect = tablist.getBoundingClientRect();
    slidyTab.style.left = `${leftRect.left - parentRect.left}px`;
    slidyTab.style.top = `${leftRect.top - parentRect.top}px`;

    slidyTab.style.bottom = `${parentRect.bottom - leftRect.bottom}px`;
    slidyTab.style.right = `${parentRect.right - rightRect.right}px`;
    // tablist.setPointerCapture(e.pointerId);
  };
  tablist.addEventListener("pointerdown", onpointerdown);
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
