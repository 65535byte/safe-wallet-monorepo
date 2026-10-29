import { createElement, useEffect, type ReactNode } from "react";
import { initializeLanguage } from "../../i18n";
import quickMarkdown from "./content/quick_app.md?raw";
import guideMarkdown from "./content/guide.md?raw";

export function documentResourceUrl(url: string): string | undefined {
  if (
    /^https:\/\/wallet\.8379hk\.com\/static\/quick\/image(?:-[1-3])?\.png$/.test(
      url,
    )
  ) {
    return `/images/quick/${url.split("/").pop()}`;
  }
  return /^https?:\/\//i.test(url) ? url : undefined;
}
function inline(text: string): ReactNode[] {
  return text
    .split(
      /(!\[[^\]]*\]\([^)]*\)|\[[^\]]*\]\([^)]*\)|<https?:\/\/[^>]+>|`[^`]+`|\*\*[^*]+\*\*)/g,
    )
    .map((part, i) => {
      const image = part.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
      if (image) {
        const src = documentResourceUrl(image[2]);
        return src ? (
          <img key={i} src={src} alt={image[1]} loading="lazy" />
        ) : (
          image[1]
        );
      }
      const link =
        part.match(/^\[([^\]]*)\]\(([^)]*)\)$/) ||
        part.match(/^<(https?:\/\/[^>]+)>$/);
      if (link) {
        const href = documentResourceUrl(link[2] || link[1]);
        return href ? (
          <a key={i} href={href} target="_blank" rel="noreferrer">
            {link[1]}
          </a>
        ) : (
          link[1]
        );
      }
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={i}>{part.slice(1, -1)}</code>;
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      return part;
    });
}
// Only render Markdown constructs used by the migrated documents. Raw HTML is text.
export function MarkdownContent({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index++];
    const key = index;
    if (!line.trim()) continue;
    if (line.startsWith("```")) {
      const code: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```"))
        code.push(lines[index++]);
      index++;
      blocks.push(
        <pre key={key}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
    } else if (/^#{1,6} /.test(line)) {
      const match = line.match(/^(#{1,6}) (.*)$/)!;
      blocks.push(
        createElement(`h${match[1].length}`, { key }, inline(match[2])),
      );
    } else if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key} />);
    } else if (/^[-*] /.test(line)) {
      const items = [line.slice(2)];
      while (index < lines.length && /^[-*] /.test(lines[index]))
        items.push(lines[index++].slice(2));
      blocks.push(
        <ul key={key}>
          {items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
    } else if (line.startsWith("> ")) {
      const quote = [line.slice(2)];
      while (index < lines.length && lines[index].startsWith("> "))
        quote.push(lines[index++].slice(2));
      blocks.push(
        <blockquote key={key}>
          {quote.map((text, i) => (
            <p key={i}>{inline(text)}</p>
          ))}
        </blockquote>,
      );
    } else {
      blocks.push(<p key={key}>{inline(line)}</p>);
    }
  }
  return <>{blocks}</>;
}
export default function MarkdownPage({ type }: { type: "quick" | "guide" }) {
  const title =
    type === "quick"
      ? "8379“添加到桌面”功能使用指南"
      : "8379 钱包 DApp 接入指南";
  useEffect(() => {
    document.title = `${title} · 8379`;
    document.documentElement.lang = "zh-CN";
    window.scrollTo({ top: 0, behavior: "auto" });
    return initializeLanguage;
  }, [title]);
  return (
    <article className="markdown-page" aria-label={title}>
      <MarkdownContent
        markdown={type === "quick" ? quickMarkdown : guideMarkdown}
      />
    </article>
  );
}
