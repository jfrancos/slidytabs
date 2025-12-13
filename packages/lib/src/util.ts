import { escapeSelector, toEscapedSelector } from "@unocss/core";
declare global {
  var sheet: CSSStyleSheet;
}

export const categorizeClasses = (classList: string[]) => {
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
