import { Attachment } from "svelte/attachments";

const transitionDuration = "250ms";

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
  inset: 0,
};

[...document.styleSheets].forEach((styleSheet) => {
  [...styleSheet.cssRules]
    .filter(
      (item) =>
        item.cssText.includes("focus-visible") && item instanceof CSSStyleRule
    )
    .forEach(({ cssText }) => {
      styleSheet.insertRule(
        cssText.replace("focus-visible\\:", "").replace(":focus-visible", "")
      );
    });
});

const activeSelector = "focus-visible:";

// TODOs
// Orientation check?
// Other parity behavior
// Can child be last?

const hasStyle = (el: Element): el is Element & ElementCSSInlineStyle =>
  "style" in el;

export const slidytabs: Attachment = (tabList) => {
  if (!(tabList.children.length > 0 && hasStyle(tabList))) {
    return;
  }
  const triggers = [...tabList.children];
  const triggerActiveClasses = [...triggers[0].classList]
    .filter((item) => item.includes(activeSelector))
    .map((item) => item.replace(activeSelector, ""));
  const triggerBaseClasses = [...triggers[0].classList].filter(
    (item) => !item.includes(activeSelector)
  );
  const onfocus = ({ target }: Event) => {
    if (!(target instanceof Element && target.matches(":focus-visible"))) {
      return;
    }
    slidyTab.classList.add(...triggerActiveClasses);
  };
  const onblur = () => {
    slidyTab.classList.remove(...triggerActiveClasses);
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
  tabList.insertBefore(slidyTab, tabList.firstChild);
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
