import { message } from "antd";
import { useSession } from "providers/DappProvider";
import { showcase, seedCategories } from "data/seed";
import { readableError } from "helpers/errors";
import { getEllipsisTxt } from "helpers/formatters";
import { voteWeight } from "helpers/reputation";
import Blockie from "./Blockie";
import Icon from "./ui/Icon";
import PillButton from "./ui/PillButton";
import Reveal from "./ui/Reveal";
import { LogoMark } from "./ui/Logo";
import Wizard from "../assets/wizzie.png";

const weights = [1, 2, 4, 8, 16, 32].map((rep) => ({ rep, points: voteWeight(rep) }));

const sampleReputation = [41, 18, 12, 7, 5, 3];

function PreviewCard({ question }) {
  return (
    <div className="bezel">
      <div className="bezel-core preview">
        <div className="vote-rail">
          <Icon name="chevronUp" size={18} style={{ color: "var(--mint)" }} />
          <span className="vote-count">{question.votes}</span>
          <Icon name="chevronDown" size={18} style={{ color: "var(--ink-4)" }} />
        </div>
        <div>
          <div className="post-meta">
            <Blockie address={question.owner} scale={2.5} />
            {getEllipsisTxt(question.owner, 4)}
            <span>·</span>
            <span>{question.category}</span>
          </div>
          <p className="preview-title">{question.title}</p>
          <div className="preview-foot">
            <span>
              {question.replies} {question.replies === 1 ? "reply" : "replies"}
            </span>
            <span>ipfs://bafy…{question.votes}q</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  const { connect, isAuthenticating } = useSession();

  async function onConnect() {
    try {
      await connect();
    } catch (error) {
      message.error(readableError(error));
    }
  }

  return (
    <main className="landing">
      <section className="hero">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="status-dot" />
              StakeOverflow · On-chain Q&amp;A · Polygon
            </span>
          </Reveal>
          <Reveal as="h1" className="display hero-title" delay={80}>
            Knowledge that <em>can't</em> be taken down.
          </Reveal>
          <Reveal as="p" className="hero-copy" delay={160}>
            Ask, answer and earn reputation in a forum nobody owns. Questions live on
            IPFS, votes settle on Polygon, and tips go straight to whoever helped you.
          </Reveal>
          <Reveal className="hero-actions" delay={240}>
            <PillButton icon="wallet" busy={isAuthenticating} onClick={onConnect}>
              Connect wallet
            </PillButton>
            <PillButton
              variant="ghost"
              icon="arrowDown"
              onClick={() =>
                document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See how it works
            </PillButton>
          </Reveal>
          <Reveal className="hero-stats" delay={320}>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Votes on-chain</div>
            </div>
            <div>
              <div className="stat-value">0%</div>
              <div className="stat-label">Platform cut on tips</div>
            </div>
            <div>
              <div className="stat-value">
                log<sub style={{ fontSize: "0.5em" }}>2</sub>
              </div>
              <div className="stat-label">Reputation-weighted votes</div>
            </div>
          </Reveal>
        </div>

        <Reveal className="cascade" delay={200} aria-label="Example questions">
          {showcase.map((question) => (
            <div className="cascade-card" key={question.title}>
              <PreviewCard question={question} />
            </div>
          ))}
          <span className="float-chip is-rep">
            <Icon name="chevronUp" size={14} /> +1 reputation · Polygon
          </span>
          <span className="float-chip is-tip">
            <Icon name="coin" size={14} /> 2.5 POL tipped
          </span>
        </Reveal>
      </section>

      <section className="section" id="how">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="display section-title">
              Three primitives.
              <br />
              <em>Zero</em> gatekeepers.
            </h2>
          </Reveal>
          <Reveal as="p" className="section-lede" delay={120}>
            No moderators to appease and no karma that vanishes with a banned account.
            The rules live in a contract anyone can read.
          </Reveal>
        </div>

        <div className="bento">
          <Reveal className="bezel span-7 row-2">
            <div className="bezel-core">
              <div>
                <div className="card-kicker">01 · Ask</div>
                <h3 className="card-title">Content-addressed posts</h3>
                <p className="card-copy">
                  Your question is pinned to IPFS and its hash is written on-chain. The text
                  can't be edited out from under the people who answered it.
                </p>
              </div>
              <div className="flow">
                <div className="flow-step">
                  <b>{"{ title, content, image }"}</b>
                  <span className="flow-tag">Draft</span>
                </div>
                <div className="flow-arrow">
                  <Icon name="arrowDown" size={16} />
                </div>
                <div className="flow-step">
                  <b>ipfs://bafybeigdyrzt5…q4</b>
                  <span className="flow-tag">Pinned</span>
                </div>
                <div className="flow-arrow">
                  <Icon name="arrowDown" size={16} />
                </div>
                <div className="flow-step">
                  <b>createPost(0x91…, uri, Solidity)</b>
                  <span className="flow-tag">Polygon</span>
                </div>
                <div className="flow-arrow">
                  <Icon name="arrowDown" size={16} />
                </div>
                <div className="flow-step">
                  <b>PostCreated → your feed</b>
                  <span className="flow-tag">Indexed</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="bezel span-5" delay={100}>
            <div className="bezel-core">
              <div>
                <div className="card-kicker">02 · Vote</div>
                <h3 className="card-title">Earned weight</h3>
                <p className="card-copy">
                  Your vote carries more weight as your reputation grows.
                </p>
              </div>
              <div className="weights">
                {weights.map(({ rep, points }, index) => (
                  <div className="weight" key={rep}>
                    <span>{points}pt</span>
                    <div
                      className="weight-bar"
                      style={{
                        height: `${18 + points * 15}%`,
                        transitionDelay: `${200 + index * 90}ms`,
                      }}
                    />
                    <span>{rep}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="bezel span-5" delay={160}>
            <div className="bezel-core">
              <div>
                <div className="card-kicker">03 · Tip</div>
                <h3 className="card-title">Wallet to wallet</h3>
                <p className="card-copy">
                  Send POL to whoever unblocked you. Nothing sits in between.
                </p>
              </div>
              <div className="big-figure">
                <span className="accent">0</span>%
              </div>
            </div>
          </Reveal>

          <Reveal className="bezel span-12" id="reputation">
            <div className="bezel-core">
              <div>
                <div className="card-kicker">The result · Reputation</div>
                <h3 className="card-title">Your reputation is your stake</h3>
                <p className="card-copy">
                  The contract has no way to transfer or sell it. It only moves when people
                  vote on your posts, and it's tracked per topic.
                  A Solidity expert isn't automatically an authority on zero-knowledge proofs.
                </p>
              </div>
              <div className="topic-cloud">
                {seedCategories.map((category, index) => (
                  <span className="topic-chip" key={category.categoryId}>
                    {category.category}
                    <span>{sampleReputation[index]} rep</span>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="closing">
        <Reveal className="wizard">
          <img src={Wizard} alt="Open Sorcerer wizard" />
        </Reveal>
        <Reveal as="h2" className="display section-title" delay={100}>
          Built in the open by <em>Open Sorcerer</em>.
        </Reveal>
        <Reveal className="hero-actions" delay={200}>
          <PillButton icon="wallet" busy={isAuthenticating} onClick={onConnect}>
            Connect wallet
          </PillButton>
          <a
            className="btn btn-ghost has-icon"
            href="https://github.com/Open-Sorcerer/DeStackOverflow"
            target="_blank"
            rel="noreferrer"
          >
            <span>Read the source</span>
            <span className="btn-icon">
              <Icon name="github" size={17} />
            </span>
          </a>
        </Reveal>
      </section>

      <footer className="footer">
        <span className="footer-brand">
          <LogoMark size={20} />
          StakeOverflow · by Open Sorcerer · MIT licensed
        </span>
        <span className="mono">Runs on Polygon Amoy</span>
      </footer>
    </main>
  );
}

export default Landing;
