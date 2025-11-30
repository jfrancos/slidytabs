import { escapeSelector as _escapeSelector } from "@unocss/core";

// import { variants } from "@unocss/preset-wind4";

// can we use unocss code to add generalized classes,
// taken directly from the shadcn trigger?

// console.log(variants({}));

// console.log(
//   variants({})[28].match("focus-visible:w-full", {
//     generator: { config: { separators: [":"] } },
//   })
// );
// console.log(variants()[1].match("data-[state=active]"));

// const escapeSelector = (str: string) =>
//   _escapeSelector(str).replaceAll("\\", "\\\\");

// preset-mini/src/_variants/data.ts matching "-data"
// rule-utils/src/pseudo.ts

const safelistGeneralizedClasses = () => {
  // changed `replace` to `replaceAll`??

  const focusSelector = ":focus-visible";
  const focusPrefix = "focus-visible:";
  const escapedFocusPrefix = "focus-visible\\:";

  const activeSelector = '[data-state="active"]';
  const activePrefix = "data-[state=active]:";
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
          console.log("\n", cssText);
          const newRule = cssText
            .replaceAll(escapedFocusPrefix, "")
            .replaceAll(focusSelector, "")
            .replaceAll(escapedActivePrefix, "")
            .replaceAll(activeSelector, "");
          console.log("\n", newRule);
          styleSheet.insertRule(newRule);
        });
    });
  }
};

export const setupIndicator = (tablistElement: HTMLElement) => {
  const focusPrefix = "focus-visible:";
  const transitionDuration = "125ms";

  const slidyTabStyles = {
    transitionDuration,
    transitionProperty: "all",
    position: "absolute",
    height: "unset",
    // inset: 0,
  };

  const triggerElement = tablistElement.querySelector("button");
  if (!triggerElement) {
    throw "Tabs Trigger <button /> not found";
  }

//   const triggerBaseClasses = [...triggerElement.classList].filter(
//     (item) => !item.includes(focusPrefix)
//   );
  const triggerBaseClasses = [...triggerElement.classList]
  tablistElement.style.position = "relative";
  const fakeIndicatorElement = document.createElement("div");
  Object.assign(fakeIndicatorElement.style, slidyTabStyles);
  fakeIndicatorElement.setAttribute("data-state", "active");
  fakeIndicatorElement.className = [...triggerBaseClasses].join(" ");
  tablistElement.append(fakeIndicatorElement);
  return fakeIndicatorElement;
};
