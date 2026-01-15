import { escapeSelector, toEscapedSelector } from "@unocss/core";
declare global {
  var sheet: CSSStyleSheet;
}

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
  // console.log(triggerClasses);
  return triggerClasses;
};

const inserted = new Set<string>();
export const safelistGeneralizedClasses = (el: HTMLElement) => {
  const activeSelector = '[data-state="active"]';
  const activePrefix = "data-[state=active]:";

  const classes = [...el.classList]
    .filter((item) => item.startsWith(activePrefix))
    .map(toEscapedSelector);

  for (const sheet of document.styleSheets) {
    try {
      walkRules(sheet.cssRules, (rule) => {
        if (
          rule instanceof CSSStyleRule &&
          activeSelector !== rule.selectorText.trim() &&
          classes.some((prefix) => rule.selectorText.startsWith(prefix))
        ) {
          const newRule = rule.cssText
            .replaceAll(escapeSelector(activePrefix), "")
            .replaceAll(activeSelector, "");
          if (!inserted.has(newRule)) {
            inserted.add(newRule);
            globalThis.sheet.insertRule(newRule);
          }
        }
      });
    } catch {}
  }
};

function walkRules(rules: CSSRuleList, visit: (rule: CSSStyleRule) => void) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      visit(rule);
    } else if ("cssRules" in rule) {
      walkRules(rule.cssRules as CSSRuleList, visit);
    }
  }
}

export const getCurrentTargetX = (e: PointerEvent) =>
  e.clientX - (e.currentTarget as Element).getBoundingClientRect().left;

export const getCurrentTargetY = (e: PointerEvent) =>
  e.clientY - (e.currentTarget as Element).getBoundingClientRect().top;
