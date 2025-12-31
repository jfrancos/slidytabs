import { escapeSelector, toEscapedSelector } from "@unocss/core";
declare global {
  var sheet: CSSStyleSheet;
}

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const categorizeClasses = (triggers: HTMLButtonElement[]) => {
  const textClasses =
    /(^|:)(text|font|color|tracking|leading|decoration|underline|line-through|overline|uppercase|lowercase|capitalize)\b/;
  const activeVariant = "data-[state=active]:";
  const triggerClasses = [];
  for (const trigger of triggers) {
    const classList = [...trigger.classList];
    const activeIndicator = classList
      .filter((item) => item.includes(activeVariant))
      .map((item) => item.replace(activeVariant, ""));
    const base = classList.filter(
      (item) => !item.includes(activeVariant) || item.match(textClasses)
    );
    triggerClasses.push({ activeIndicator, base });
  }
  return triggerClasses;
};

const inserted = new Set<string>();
export const safelistGeneralizedClasses = (el: HTMLElement) => {
  const activeSelector = '[data-state="active"]';
  const activePrefix = "data-[state=active]:";

  const classes = [...el.classList]
    .filter((item) => item.startsWith(activePrefix))
    .map(toEscapedSelector);

  if (typeof document !== "undefined") {
    try {
      [...document.styleSheets].forEach((styleSheet) => {
        [...styleSheet.cssRules]
          .filter(
            (item) =>
              // for firefox
              item instanceof CSSStyleRule &&
              activeSelector !== item.selectorText.trim() &&
              classes.some((prefix) => item.selectorText.startsWith(prefix))
          )
          .forEach(({ cssText }) => {
            const newRule = cssText
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
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

export const getCurrentTargetY = (e: PointerEvent) =>
  e.clientY - (e.currentTarget as Element).getBoundingClientRect().top;
