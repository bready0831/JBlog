"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const PROSE_CLASSES =
  "prose prose-base prose-zinc max-w-none dark:prose-invert " +
  "prose-p:mt-4 prose-p:mb-8 prose-p:leading-7 prose-p:font-normal " +
  "prose-li:font-normal prose-li:my-1 " +
  "prose-headings:mt-12 prose-headings:mb-2 prose-headings:font-semibold";

const sansStyle = { fontFamily: "var(--font-geist-sans)" };

function getCodeLang(children: React.ReactNode): string | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (typeof child !== "object" || child === null || !("props" in child)) return null;
  const { className } = (child as { props: { className?: string } }).props;
  const match = String(className ?? "").match(/language-(\S+)/);
  return match ? match[1] : null;
}

const components: Components = {
  h1: ({ children }) => <h1 style={sansStyle}>{children}</h1>,
  h2: ({ children }) => <h2 style={sansStyle}>{children}</h2>,
  h3: ({ children }) => <h3 style={sansStyle}>{children}</h3>,
  h4: ({ children }) => <h4 style={sansStyle}>{children}</h4>,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className="w-full rounded-sm my-6" />
  ),
  pre: ({ children }) => {
    const lang = getCodeLang(children);
    return (
      <div
        className="relative my-6 rounded-lg overflow-hidden"
        style={{ backgroundColor: "var(--code-bg)" }}
      >
        {lang && (
          <span className="absolute top-3 right-4 text-xs text-zinc-500 font-mono select-none">
            {lang}
          </span>
        )}
        <pre style={{ background: "transparent" }}>{children}</pre>
      </div>
    );
  },
  code: ({ className, children }) => (
    <code
      className={className}
      style={className?.includes("hljs") ? { background: "transparent" } : undefined}
    >
      {children}
    </code>
  ),
};

export default function PostContent({ content }: { content: string }) {
  return (
    <div className={PROSE_CLASSES} style={{ fontFamily: "var(--font-serif)" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
