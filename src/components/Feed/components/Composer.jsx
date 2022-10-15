import { useEffect, useState } from "react";
import { message } from "antd";
import { useDapp } from "providers/DappProvider";
import { useForumActions } from "data";
import { readableError } from "helpers/errors";
import Icon from "components/ui/Icon";
import PillButton from "components/ui/PillButton";
import Markdown from "components/ui/Markdown";

/** Writes a question, or a reply when `parentId` is given. */
const Composer = ({ parentId, onDone }) => {
  const { selectedCategory } = useDapp();
  const { createPost } = useForumActions();
  const isReply = Boolean(parentId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [stage, setStage] = useState(null);
  const [mode, setMode] = useState("write");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function clearFile() {
    setFile(null);
    // Remounting the input is the only way to really clear a file input.
    setFileInputKey((key) => key + 1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (stage) return;
    if (!content.trim() || (!isReply && !title.trim())) {
      message.error(isReply ? "Write your reply first." : "Add a title and some detail.");
      return;
    }

    setStage("Preparing");
    try {
      await createPost({
        parentId,
        categoryId: selectedCategory.categoryId,
        title: isReply ? undefined : title.trim(),
        content: content.trim(),
        file: file || undefined,
        onStage: setStage,
      });
    } catch (error) {
      // Keep the draft so nothing is lost when the upload or transaction fails.
      setStage(null);
      message.error(readableError(error));
      return;
    }

    setStage(null);
    setTitle("");
    setContent("");
    setMode("write");
    clearFile();
    message.success(isReply ? "Reply published" : "Question published");
    onDone?.();
  }

  return (
    <form className={`bezel composer rise ${isReply ? "is-reply" : ""}`} onSubmit={onSubmit}>
      <div className="bezel-core">
        {!isReply && (
          <input
            className="field field-title"
            placeholder="What do you want to know?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Question title"
            autoFocus
          />
        )}
        <div className="composer-tabs">
          <div className="segmented" role="tablist" aria-label="Editor mode">
            {["write", "preview"].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                className={mode === tab ? "is-active" : ""}
                onClick={() => setMode(tab)}
              >
                {tab === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>
          <span className="composer-hint">
            Markdown supported · <code>```solidity</code> for code
          </span>
        </div>
        {mode === "preview" ? (
          <div className="composer-render">
            {content.trim() ? (
              <Markdown className="post-body">{content}</Markdown>
            ) : (
              <p className="composer-empty">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
        <textarea
          className="field field-body"
          placeholder={
            isReply
              ? "Share what you know…"
              : "Add the details: what you tried, what you expected, what happened."
          }
          rows={isReply ? 3 : 5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label={isReply ? "Reply" : "Question details"}
          autoFocus={isReply}
        />
        )}

        {preview && (
          <div className="composer-preview rise">
            <img src={preview} alt="Attachment preview" />
          </div>
        )}

        <div className="composer-foot">
          <div className="composer-tools">
            <label className="pill" style={{ cursor: "pointer" }}>
              <Icon name="image" size={16} />
              <span className="file-name">{file ? file.name : "Attach image"}</span>
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </label>
            {file && (
              <button type="button" className="action" onClick={clearFile} aria-label="Remove image">
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
          <div className="composer-tools">
            {stage && <span className="stage">{stage}…</span>}
            <PillButton
              type="submit"
              size="sm"
              icon={isReply ? "send" : "arrowUpRight"}
              busy={Boolean(stage)}
              disabled={Boolean(stage)}
            >
              {isReply ? "Reply" : "Publish"}
            </PillButton>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Composer;
