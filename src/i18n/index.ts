import chinese from "./locales/zh-CN.json";
import english from "./locales/en.json";

export type Language = "zh-CN" | "en";
export type MessageKey = keyof typeof chinese;
export type MessageValues = Record<
  string,
  string | number | bigint | undefined
>;
export const LANGUAGE_STORAGE_KEY = "8379.language";
export const languageNames: Record<Language, string> = {
  "zh-CN": "中文",
  en: "English",
};
export const isLanguage = (value: unknown): value is Language =>
  value === "zh-CN" || value === "en";
export function systemLanguage(): Language {
  try {
    if (typeof navigator === "undefined") return "en";
    const locale = navigator.languages?.[0] || navigator.language || "";
    return /^zh(?:-|_|$)/i.test(locale) ? "zh-CN" : "en";
  } catch {
    return "en";
  }
}
let lastKnownLanguage: Language | undefined;
export function getLanguage(): Language {
  try {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
        : null;
    lastKnownLanguage = isLanguage(saved) ? saved : systemLanguage();
    return lastKnownLanguage;
  } catch {
    return lastKnownLanguage ?? systemLanguage();
  }
}
export function setLanguage(language: Language): boolean {
  if (typeof window === "undefined" || !isLanguage(language)) return false;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    return false;
  }
  lastKnownLanguage = language;
  if (typeof document !== "undefined") document.documentElement.lang = language;
  return true;
}
export function translateMessage(
  key: MessageKey,
  values: MessageValues = {},
): string {
  const catalog: Partial<Record<MessageKey, string>> =
    getLanguage() === "en" ? english : chinese;
  return (catalog[key] ?? chinese[key]).replace(
    /\{\{(\w+)\}\}/g,
    (placeholder, name: string) =>
      Object.prototype.hasOwnProperty.call(values, name)
        ? String(values[name] ?? "")
        : placeholder,
  );
}
export function formatDate(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(getLanguage() === "en" ? "en-US" : "zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
}
export function initializeLanguage() {
  document.documentElement.lang = getLanguage();
  document.title =
    getLanguage() === "en" ? "8379 · Multisig wallet" : "8379 · 多签钱包";
}
