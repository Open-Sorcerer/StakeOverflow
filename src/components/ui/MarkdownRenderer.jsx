import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { common } from "lowlight";
import solidityModule from "highlightjs-solidity";
import Icon from "./Icon";

// highlightjs-solidity is CommonJS; under Vite its exports can arrive wrapped.
const { solidity } = solidityModule.solidity ? solidityModule : solidityModule.default;

const highlight = [
  rehypeHighlight,
  { languages: { ...common, solidity }, aliases: { solidity: ["sol"] } },
];

function CodeBlock({ children }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const language = children?.props?.className?.match(/language-([\w-]+)/)?.[1];

  async function copy() {
    await navigator.clipboard.writeText(ref.current?.innerText ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{language ?? "code"}</span>
        <button type="button" className="code-copy" onClick={copy} aria-label="Copy code">
          <Icon name={copied ? "check" : "copy"} size={14} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

const components = {
  pre: CodeBlock,
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
};

/** GitHub-flavoured markdown with highlighted code. Raw HTML is not rendered. */
function MarkdownRenderer({ children, className = "" }) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[highlight]} components={components}>
        {children ?? ""}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
