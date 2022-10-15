import { lazy, Suspense } from "react";

// The markdown and syntax-highlighting stack is ~130 KB gzipped, so it loads in its own
// chunk, kept off the landing page. Until it arrives, the raw text shows in its place.
const loadRenderer = () => import("./MarkdownRenderer");
const MarkdownRenderer = lazy(loadRenderer);

/** Starts downloading the renderer ahead of first use. */
export const preloadMarkdown = () => loadRenderer();

function Markdown({ children, className = "" }) {
  return (
    <Suspense
      fallback={
        <div className={`markdown ${className}`} style={{ whiteSpace: "pre-wrap" }}>
          {children}
        </div>
      }
    >
      <MarkdownRenderer className={className}>{children}</MarkdownRenderer>
    </Suspense>
  );
}

export default Markdown;
