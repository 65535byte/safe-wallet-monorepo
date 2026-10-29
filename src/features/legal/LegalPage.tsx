import TransferPage from "../transfer/TransferPage";
import MarkdownPage from "../docs/MarkdownPage";
import { useEffect } from "react";
import { initializeLanguage, systemLanguage } from "../../i18n";
import SupportPage from "./SupportPage";
import privacyZh from "./content/privacy.zh-CN.json";
import privacyEn from "./content/privacy.en.json";
import termsZh from "./content/terms.zh-CN.json";
import termsEn from "./content/terms.en.json";
export type LegalDocumentType =
  | "transfer"
  | "quick"
  | "guide"
  | "privacy"
  | "terms"
  | "help"
  | "service"
  | "community"
  | "suggest";
export function legalDocumentType(
  pathname: string,
): LegalDocumentType | undefined {
  const path = pathname
    .replace(/\/+$/, "")
    .replace(
      /^\/pages\/(privacy-policy|terms-service|help|service|community|suggest)\/index$/,
      "/$1",
    );
  if (
    path === "/transfer" ||
    path === "/pages/transfer" ||
    path === "/pages/transfer/index"
  )
    return "transfer";
  if (path === "/quick" || path === "/pages/quick") return "quick";
  if (path === "/guide") return "guide";
  if (path === "/suggest") return "suggest";
  if (path === "/help") return "help";
  if (path === "/service") return "service";
  if (path === "/community") return "community";
  if (path === "/privacy-policy") return "privacy";
  if (path === "/terms-service" || path === "/terms-of-service") return "terms";
  return undefined;
}
export default function LegalPage({ type }: { type: LegalDocumentType }) {
  if (type === "transfer") return <TransferPage />;
  if (type === "quick" || type === "guide") return <MarkdownPage type={type} />;
  if (
    type === "help" ||
    type === "service" ||
    type === "community" ||
    type === "suggest"
  )
    return <SupportPage type={type} />;
  return <LegalDocument type={type} />;
}
function LegalDocument({ type }: { type: "privacy" | "terms" }) {
  const english = systemLanguage() === "en";
  const content =
    type === "privacy"
      ? english
        ? privacyEn
        : privacyZh
      : english
        ? termsEn
        : termsZh;
  useEffect(() => {
    document.documentElement.lang = english ? "en" : "zh-CN";
    document.title = `${content.title} · 8379`;
    window.scrollTo({ top: 0, behavior: "auto" });
    return initializeLanguage;
  }, [content.title]);
  return (
    <article className="legal-page">
      <header className="legal-heading">
        <h1>{english ? content.title : `《${content.title}》`}</h1>
        <p className="muted">{content.updatedAt}</p>
        {content.intro.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </header>
      {content.sections.map((section, index) => (
        <section className="legal-section" key={index}>
          <h2>{section.title}</h2>
          {section.blocks.map((block, i) =>
            block.type === "email" ? (
              <p key={i}>
                <a className="legal-email" href={`mailto:${block.text}`}>
                  {block.text}
                </a>
              </p>
            ) : (
              <p
                className={
                  block.type === "item" ? "legal-list-item" : undefined
                }
                key={i}
              >
                {block.text}
              </p>
            ),
          )}
        </section>
      ))}
    </article>
  );
}
