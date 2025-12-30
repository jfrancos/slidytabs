import { escapeSelector, toEscapedSelector } from "@unocss/core";
declare global {
  var sheet: CSSStyleSheet;
}

export const categorizeClasses = (triggers: HTMLButtonElement[]) => {
  // console.log("hasdf");
  const textClasses =
    /(^|:)(text|font|color|tracking|leading|decoration|underline|line-through|overline|uppercase|lowercase|capitalize)\b/;
  const activeVariant = "data-[state=active]:";
  // const focusVariant = "focus-visible:";
  const triggerClasses = [];
  for (const trigger of triggers) {
    const classList = [...trigger.classList];
    const activeIndicator = classList
      .filter(
        (item) => item.includes(activeVariant) //&& !item.match(textClasses)
      )
      .map((item) => item.replace(activeVariant, ""));

    // console.log(activeIndicator);
    // const focus = classList
    //   .filter((item) => item.includes(focusVariant))
    //   .map((item) => item.replace(focusVariant, ""));
    const base = classList.filter(
      (item) =>
        // !item.includes(focusVariant) &&
        !item.includes(activeVariant) || item.match(textClasses)
    );
    // console.log(base);
    // const activeText = active.filter((item) => item.match(textClasses));
    // const activeIndicator = active.filter((item) => !item.match(textClasses));
    // const activeIndicator = active.filter((item) => !item.match(textClasses));
    // const focusText = focus.filter((item) => item.match(textClasses));
    // const focusIndicator = focus.filter((item) => !item.match(textClasses));
    triggerClasses.push({
      // activeText,
      activeIndicator,
      // focusText,
      // focusIndicator,
      base,
    });
  }
  return triggerClasses;
};
// export const categorizeClasses = (triggers: HTMLButtonElement[]) => {
//   // we need to revamp this
//   // such that textclasses stay in place as-is
//   const textClasses =
//     /^(text|font|color|tracking|leading|decoration|underline|line-through|overline|uppcase|lowercase|capitalize)/;
//   const activeVariant = "data-[state=active]:";
//   const focusVariant = "focus-visible:";
//   const triggerClasses = [];
//   for (const trigger of triggers) {
//     const classList = [...trigger.classList];
//     const active = classList
//       .filter((item) => item.includes(activeVariant))
//       .map((item) => item.replace(activeVariant, ""));
//     const focus = classList
//       .filter((item) => item.includes(focusVariant))
//       .map((item) => item.replace(focusVariant, ""));
//     const base = classList.filter(
//       (item) => !(item.includes(focusVariant) || item.includes(activeVariant))
//     );
//     const activeText = active.filter((item) => item.match(textClasses));
//     const activeIndicator = active.filter((item) => !item.match(textClasses));
//     const focusText = focus.filter((item) => item.match(textClasses));
//     const focusIndicator = focus.filter((item) => !item.match(textClasses));
//     triggerClasses.push({
//       activeText,
//       activeIndicator,
//       focusText,
//       focusIndicator,
//       base,
//     });
//   }
//   return triggerClasses;
// };

const inserted = new Set<string>();

export const safelistGeneralizedClasses = (el: HTMLElement) => {
  const focusSelector = ":focus-visible";
  const focusPrefix = "focus-visible:";
  const activeSelector = '[data-state="active"]';
  const activePrefix = "data-[state=active]:";

  const classes = [...el.classList]
    .filter(
      (item) => item.startsWith(focusPrefix) || item.startsWith(activePrefix)
    )
    .map(toEscapedSelector);

  if (typeof document !== "undefined") {
    try {
      [...document.styleSheets].forEach((styleSheet) => {
        [...styleSheet.cssRules]
          .filter(
            (item) =>
              // for firefox
              item instanceof CSSStyleRule &&
              ![focusSelector, activeSelector].includes(
                item.selectorText.trim()
              ) &&
              classes.some((prefix) => item.selectorText.startsWith(prefix))
          )
          .forEach(({ cssText }) => {
            const newRule = cssText
              .replaceAll(escapeSelector(focusPrefix), "")
              .replaceAll(focusSelector, "")
              .replaceAll(escapeSelector(activePrefix), "")
              .replaceAll(activeSelector, "");
            if (!inserted.has(newRule)) {
              inserted.add(newRule);
              globalThis.sheet.insertRule(newRule);
            }
          });
      });
    } catch {}
  }
};

export const getCurrentTargetX = (e: PointerEvent) =>
  e.clientY - (e.currentTarget as Element).getBoundingClientRect().left;

export const getCurrentTargetY = (e: PointerEvent) =>
  e.clientY - (e.currentTarget as Element).getBoundingClientRect().top;
