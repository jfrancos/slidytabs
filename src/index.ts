import type { Attachment } from "svelte/attachments";

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

export const slidytabs = (): Attachment => (tabList) => {
  if (!(tabList instanceof HTMLElement && tabList.children.length > 0)) {
    return;
  }

  const triggers = [...tabList.children] as HTMLElement[];
  const transferFocus = () => {
    slidyTab.focus();
  };
  triggers.forEach((item) => {
    Object.assign(item.style, triggersAddedStyles);
    item.addEventListener("focus", transferFocus);
  });

  const slidyTab = document.createElement("button");
  const onKeyDown = (e: KeyboardEvent) => {
    triggers
      .find((item) => item.getAttribute("data-state") === "active")
      ?.dispatchEvent(new KeyboardEvent(e.type, e));
  };
  slidyTab.addEventListener("keydown", onKeyDown);
  slidyTab.setAttribute("data-state", "active");
  Object.assign(slidyTab.style, slidyTabStyles);
  slidyTab.className = triggers[0].className;

  tabList.insertBefore(slidyTab, tabList.firstChild);
  tabList.style.position = "relative";

  const callback: MutationCallback = (mutationList) => {
    mutationList.map(({ target }) => target).forEach(syncTab);
  };

  const syncTab = (tab: Node) => {
    if (
      !(tab instanceof HTMLElement) ||
      tab.getAttribute("data-state") !== "active"
    ) {
      return;
    }
    tab.setAttribute("tabindex", "-1");
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
      item.removeEventListener("focus", transferFocus);
    });
  };
};
