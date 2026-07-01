"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const sansStyle = { fontFamily: "var(--font-geist-sans)" };

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
    const code = Array.isArray(children) ? children[0] : children;
    const className =
      typeof code === "object" &&
      code !== null &&
      "props" in code &&
      typeof code.props === "object" &&
      code.props !== null &&
      "className" in code.props
        ? String(code.props.className ?? "")
        : "";
    const match = className.match(/language-(\S+)/);
    const lang = match ? match[1] : null;
    return (
      <div className="relative my-6">
        {lang && (
          <span className="absolute top-3 right-4 text-xs text-zinc-500 font-mono select-none">
            {lang}
          </span>
        )}
        <pre>{children}</pre>
      </div>
    );
  },
};

export default function PostContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-base prose-zinc max-w-none dark:prose-invert prose-p:mt-4 prose-p:mb-8 prose-p:leading-7 prose-p:font-normal prose-li:font-normal prose-li:my-1 prose-ol:my-4 prose-ul:my-4 prose-headings:mt-12 prose-headings:mb-2 prose-headings:font-semibold"
      style={{ fontFamily: "var(--font-serif)" }}
    >
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
