import { Attachment } from "svelte/attachments";
import { twMerge } from "tailwind-merge";
// import css from "@webref/css";

// console.log(css.listAll({ folder: "./" }));

const transitionDuration = "250ms";

const slidyTabStyles = {
  transitionDuration,
  transitionProperty: "all",
  position: "absolute",
  inset: "0",
  // zIndex: 9,
};

const focusSelector = ":focus-visible";
const focusPrefix = "focus-visible:";
const escapedFocusPrefix = "focus-visible\\:";

const activeSelector = '[data-state="active"]';
const activePrefix = "data-[state=active]:";
const escapedActivePrefix = "data-\\[state\\=active\\]\\:";

// console.log(document);

// [...document.styleSheets].forEach((styleSheet) => {
//   [...styleSheet.cssRules]
//     .filter(
//       (item) =>
//         item instanceof CSSStyleRule &&
//         // firefox exposes reset styles but chrome does not
//         ![focusSelector, activeSelector].includes(item.selectorText.trim())
//         //  &&
//         // (item.selectorText.includes(focusSelector) ||
//         //   item.selectorText.includes(activeSelector))
//     )
//     .forEach(({ cssText }) => {
//       styleSheet.insertRule(
//         cssText
//           .replace(escapedFocusPrefix, "")
//           .replace(focusSelector, "")
//           // .replace(escapedActivePrefix, "")
//           // .replace(activeSelector, "")
//       );
//     });
// });

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

// TODOs
// Orientation check?
// Other parity behavior
// I think we can do the weird green thing if we do more class filtering
// but maybe that's a sign to some other ? approach?

const hasStyle = (el: Element): el is Element & ElementCSSInlineStyle =>
  "style" in el;

export const slidytabs: Attachment = (tabList) => {
  if (!(tabList.children.length > 0 && hasStyle(tabList))) {
    return;
  }
  const triggers = [...tabList.children];
  const triggerActiveClasses = [...triggers[0].classList]
    .filter((item) => item.includes(activePrefix))
    .map((item) => item.replace(activePrefix, ""));
  const triggerFocusClasses = [...triggers[0].classList]
    .filter((item) => item.includes(focusPrefix))
    .map((item) => item.replace(focusPrefix, ""));
  const triggerBaseClasses = [...triggers[0].classList].filter(
    (item) => !item.includes(activePrefix) && !item.includes(focusPrefix)
  );

  console.log(triggerFocusClasses);

  // const triggerNotActiveClasses = [...triggers[0].classList].filter(
  //   (item) => !item.includes("data-[state=active]:")
  // );
  const onfocus = ({ currentTarget }: Event) => {
    if (
      !(
        currentTarget instanceof Element &&
        currentTarget.matches(":focus-visible")
      )
    ) {
      return;
    }
    console.log("focus");
    slidyTab.classList = twMerge(
      ...triggerBaseClasses,
      ...triggerActiveClasses,
      ...triggerFocusClasses
    );
  };
  const onblur = () => {
    console.log("blur");
    slidyTab.className = [...triggerBaseClasses, ...triggerActiveClasses].join(
      " "
    );
  };
  triggers.forEach((item) => {
    if (hasStyle(item)) {
      item.style.zIndex = "10";
    }
    item.classList = triggerBaseClasses.join(" ");
    item.addEventListener("focus", onfocus);
    item.addEventListener("keydown", onfocus, true);
    item.addEventListener("blur", onblur);
  });

  const slidyTab = document.createElement("div");
  slidyTab.setAttribute("data-state", "active");
  Object.assign(slidyTab.style, slidyTabStyles);
  slidyTab.className = [...triggerBaseClasses, ...triggerActiveClasses].join(
    " "
  );
  // slidyTab.className = twMerge([...triggerBaseClasses].join(" "));
  tabList.append(slidyTab);
  tabList.style.position = "relative";
  console.log([...tabList.computedStyleMap().entries()]);

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
