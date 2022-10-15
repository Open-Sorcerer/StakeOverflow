import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDapp } from "providers/DappProvider";
import { useCategories, usePostContent, useProfile } from "data";
import { getEllipsisTxt } from "helpers/formatters";
import { sameAddress, timeAgo } from "helpers/content";
import { SUPPORTED_CHAIN } from "config";
import Blockie from "./Blockie";
import Icon from "./ui/Icon";
import Markdown from "./ui/Markdown";
import Post from "./Feed/components/Post";
import { useOpenTopic } from "./navigation";

const isAddress = (value) => /^0x[0-9a-f]{40}$/i.test(value);

const Stat = ({ label, value, accent }) => (
  <div className="bezel">
    <div className="bezel-core profile-stat">
      <div className={`stat-value ${accent ? "accent" : ""}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

/** One of this person's answers, with a link back to the question's thread. */
function AnswerCard({ reply, question, isAccepted, index }) {
  const { content } = usePostContent(reply.contentId);
  const { content: questionContent } = usePostContent(question?.contentId);
  const { categories } = useCategories();
  const { setFocusPostId } = useDapp();
  const openTopic = useOpenTopic();
  const topic = categories.find((c) => c.categoryId === reply.categoryId);

  function openThread() {
    setFocusPostId(question.postId);
    openTopic(topic, { focusPostId: question.postId });
  }

  return (
    <article className="bezel rise" style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
      <div className="bezel-core answer-card">
        <div className="post-meta">
          {topic && <span className="topic-tag">{topic.category}</span>}
          {isAccepted && (
            <span className="solved-badge">
              <Icon name="checkCircle" size={13} />
              Accepted
            </span>
          )}
          <span>
            {reply.votes} {reply.votes === 1 ? "vote" : "votes"}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(reply.createdAt).toISOString()}>{timeAgo(reply.createdAt)}</time>
        </div>
        {question && (
          <button type="button" className="answer-question" onClick={openThread}>
            <span>{questionContent?.title ?? "Open question"}</span>
            <span className="tile-arrow">
              <Icon name="arrowUpRight" size={15} />
            </span>
          </button>
        )}
        {content && <Markdown className="post-body answer-excerpt">{content.content}</Markdown>}
      </div>
    </article>
  );
}

function Profile() {
  const { address } = useParams();
  const { walletAddress, isGuest } = useDapp();
  const profile = useProfile(address);
  const openTopic = useOpenTopic();
  const [tab, setTab] = useState("questions");
  const [copied, setCopied] = useState(false);
  const isMe = sameAddress(address, walletAddress);

  if (!isAddress(address)) {
    return (
      <div className="bezel rise">
        <div className="bezel-core empty">
          <span className="eyebrow">Profile</span>
          <p className="empty-title">No such address.</p>
          <p className="empty-copy">“{address}” isn't a valid wallet address.</p>
        </div>
      </div>
    );
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const maxReputation = profile.reputation[0]?.value ?? 1;
  const tabs = [
    { id: "questions", label: "Questions", count: profile.questions.length },
    { id: "answers", label: "Answers", count: profile.answers.length },
  ];

  return (
    <>
      <header className="profile-head rise">
        <div className="profile-avatar">
          <Blockie address={address} size={8} scale={11} />
        </div>
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow">
            {isMe ? (isGuest ? "Your guest profile" : "Your profile") : "Profile"}
          </span>
          <h1 className="display profile-name" title={address}>
            {getEllipsisTxt(address, 6)}
          </h1>
          <div className="wallet-actions">
            <button type="button" className="pill" onClick={copyAddress}>
              <Icon name={copied ? "check" : "copy"} size={16} />
              {copied ? "Copied" : "Copy address"}
            </button>
            {!(isMe && isGuest) && (
              <a
                className="pill"
                href={`${SUPPORTED_CHAIN.explorer}/address/${address}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="external" size={16} />
                Polygonscan
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="profile-stats rise">
        <Stat label="Reputation" value={profile.totalReputation} accent />
        <Stat label="Questions" value={profile.questions.length} />
        <Stat label="Answers" value={profile.answers.length} />
        <Stat label="Accepted" value={profile.acceptedCount} />
      </div>

      <div className="bezel rise">
        <div className="bezel-core profile-topics">
          <span className="card-kicker">Reputation by topic</span>
          {profile.reputation.length === 0 ? (
            <p className="rep-caption">No reputation yet. It grows when people upvote these posts.</p>
          ) : (
            <div className="rep-bars">
              {profile.reputation.map((topic) => (
                <button
                  type="button"
                  key={topic.categoryId}
                  className="rep-bar"
                  onClick={() => openTopic(topic)}
                >
                  <span className="rep-bar-name">{topic.category}</span>
                  <span className="rep-bar-track">
                    <span
                      className="rep-bar-fill"
                      style={{ transform: `scaleX(${topic.value / maxReputation})` }}
                    />
                  </span>
                  <span className="rep-bar-value">{topic.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="feed-toolbar rise">
        <div className="segmented" role="tablist" aria-label="Profile activity">
          {tabs.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={tab === option.id}
              className={tab === option.id ? "is-active" : ""}
              onClick={() => setTab(option.id)}
            >
              {option.label}
              <span className="segmented-count">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack" key={tab}>
        {tab === "questions" &&
          profile.questions.map((post, index) => (
            <Post key={post.postId} post={post} index={index} showTopic />
          ))}
        {tab === "answers" &&
          profile.answers.map(({ reply, question, isAccepted }, index) => (
            <AnswerCard
              key={reply.postId}
              reply={reply}
              question={question}
              isAccepted={isAccepted}
              index={index}
            />
          ))}
        {((tab === "questions" && !profile.questions.length) ||
          (tab === "answers" && !profile.answers.length)) && (
          <div className="bezel rise">
            <div className="bezel-core empty">
              <p className="empty-title">Nothing here yet.</p>
              <p className="empty-copy">
                {tab === "questions" ? "No questions asked so far." : "No answers written so far."}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
