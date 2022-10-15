import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { useSendTransaction, useSwitchChain } from "wagmi";
import { useDapp } from "providers/DappProvider";
import { ROOT_PARENT_ID, SUPPORTED_CHAIN } from "config";
import { sameAddress } from "helpers/content";
import { voteWeight } from "helpers/reputation";
import { createSeedState, VIEWER_REPUTATION } from "./seed";

/**
 * In-memory forum store, seeded with sample threads. It stands in for the
 * contract until it is redeployed: wallets are real (wagmi), but posts, votes
 * and reputation live here. Votes follow the contract's weighting and
 * one-vote-per-post rule; unlike today's contract, self-downvotes are blocked.
 */
const ForumContext = createContext();

/** Reputation an answer's author gains when the asker accepts it. */
export const ACCEPT_REWARD = 5;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const key = (address) => address?.toLowerCase();
const reputationOf = (state, address, categoryId) => state.reputation[key(address)]?.[categoryId] ?? 0;
const isQuestion = (post) => post.parentId === ROOT_PARENT_ID;
const newestFirst = (a, b) => b.createdAt - a.createdAt;
const topFirst = (a, b) => b.votes - a.votes || newestFirst(a, b);

/** Number of direct replies per post id. */
const replyCounts = (posts) => {
  const counts = {};
  Object.values(posts).forEach((post) => {
    if (!isQuestion(post)) counts[post.parentId] = (counts[post.parentId] ?? 0) + 1;
  });
  return counts;
};

const withReputation = (reputation, address, categoryId, delta) => {
  const author = key(address);
  const current = reputation[author]?.[categoryId] ?? 0;
  return {
    ...reputation,
    [author]: { ...reputation[author], [categoryId]: Math.max(0, current + delta) },
  };
};

function reducer(state, action) {
  switch (action.type) {
    case "initViewer":
      if (state.reputation[action.address]) return state;
      return {
        ...state,
        reputation: { ...state.reputation, [action.address]: { ...VIEWER_REPUTATION } },
      };
    case "addPost":
      return { ...state, posts: { ...state.posts, [action.post.postId]: action.post } };
    case "vote": {
      const post = state.posts[action.postId];
      const up = action.direction === "up";
      // Like voteUp/voteDown: move the author's reputation in the post's topic, floored at 0.
      const author = key(post.postOwner);
      const current = reputationOf(state, author, post.categoryId);
      const next = up ? current + action.weight : Math.max(0, current - action.weight);
      return {
        ...state,
        reputation: {
          ...state.reputation,
          [author]: { ...state.reputation[author], [post.categoryId]: next },
        },
        posts: {
          ...state.posts,
          [post.postId]: {
            ...post,
            votes: up ? post.votes + 1 : Math.max(0, post.votes - 1),
            voters: { ...post.voters, [action.voter]: action.direction },
          },
        },
      };
    }
    case "accept": {
      // Toggle: accepting the current answer again un-accepts it. The reward moves with it,
      // except for answers the asker wrote themselves.
      const question = state.posts[action.questionId];
      const previous = question.acceptedReplyId;
      const next = previous === action.replyId ? null : action.replyId;
      let { reputation } = state;
      const reward = (replyId, delta) => {
        const reply = state.posts[replyId];
        if (reply && !sameAddress(reply.postOwner, question.postOwner)) {
          reputation = withReputation(reputation, reply.postOwner, question.categoryId, delta);
        }
      };
      if (previous) reward(previous, -ACCEPT_REWARD);
      if (next) reward(next, ACCEPT_REWARD);
      return {
        ...state,
        reputation,
        posts: { ...state.posts, [question.postId]: { ...question, acceptedReplyId: next } },
      };
    }
    default:
      return state;
  }
}

export function ForumProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeedState);
  const { walletAddress } = useDapp();

  // Give each newly connected wallet its starting reputation.
  useEffect(() => {
    if (walletAddress) dispatch({ type: "initViewer", address: key(walletAddress) });
  }, [walletAddress]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

const useForum = () => useContext(ForumContext);

export function useCategories() {
  const { state } = useForum();
  return { categories: state.categories, isLoading: false };
}

/** Questions in a topic. `sort` is "newest", "top" or "unanswered" (no replies yet). */
export function usePosts(categoryId, sort = "newest") {
  const { state } = useForum();
  const posts = useMemo(() => {
    const counts = replyCounts(state.posts);
    const questions = Object.values(state.posts).filter(
      (post) => isQuestion(post) && post.categoryId === categoryId
    );
    if (sort === "top") return questions.sort(topFirst);
    if (sort === "unanswered") return questions.filter((q) => !counts[q.postId]).sort(newestFirst);
    return questions.sort(newestFirst);
  }, [state.posts, categoryId, sort]);
  return { posts, isLoading: false };
}

/** Questions in any topic whose title or body, or any of whose replies, mention `query`. */
export function useSearch(query) {
  const { state } = useForum();
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const matches = new Set();
    Object.values(state.posts).forEach((post) => {
      const text = `${post.content?.title ?? ""} ${post.content?.content ?? ""}`.toLowerCase();
      if (text.includes(needle)) matches.add(isQuestion(post) ? post.postId : post.parentId);
    });
    return [...matches].map((id) => state.posts[id]).filter(Boolean).sort(topFirst);
  }, [state.posts, query]);
}

/** Everything a profile page shows for one address. */
export function useProfile(address) {
  const { state } = useForum();
  return useMemo(() => {
    const owned = Object.values(state.posts).filter((post) => sameAddress(post.postOwner, address));
    const questions = owned.filter(isQuestion).sort(newestFirst);
    const answers = owned
      .filter((post) => !isQuestion(post))
      .sort(newestFirst)
      .map((reply) => {
        const question = state.posts[reply.parentId];
        return { reply, question, isAccepted: question?.acceptedReplyId === reply.postId };
      });
    const reputation = state.categories
      .map((category) => ({ ...category, value: reputationOf(state, address, category.categoryId) }))
      .filter((topic) => topic.value > 0)
      .sort((a, b) => b.value - a.value);
    return {
      questions,
      answers,
      acceptedCount: answers.filter((answer) => answer.isAccepted).length,
      reputation,
      totalReputation: reputation.reduce((sum, topic) => sum + topic.value, 0),
    };
  }, [state, address]);
}

export function useReplies(parentId) {
  const { state } = useForum();
  const replies = useMemo(
    () =>
      Object.values(state.posts)
        .filter((post) => post.parentId === parentId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [state.posts, parentId]
  );
  return { replies, isLoading: false };
}

export function usePostContent(contentId) {
  const { state } = useForum();
  const post = Object.values(state.posts).find((p) => p.contentId === contentId);
  return { content: post?.content ?? null, error: null, isLoading: !post };
}

export function usePostVotes(postId) {
  const { state } = useForum();
  const { walletAddress } = useDapp();
  const post = state.posts[postId];
  return { count: post?.votes ?? 0, myVote: post?.voters[key(walletAddress)] ?? null };
}

/** The connected wallet's reputation in a topic. */
export function useReputation(categoryId) {
  const { state } = useForum();
  const { walletAddress } = useDapp();
  return reputationOf(state, walletAddress, categoryId);
}

let nextId = 1;

export function useForumActions() {
  const { state, dispatch } = useForum();
  const { walletAddress, chainId, isGuest } = useDapp();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  function requireWallet() {
    if (!walletAddress) throw new Error("Connect your wallet first.");
  }

  async function createPost({ parentId = ROOT_PARENT_ID, categoryId, title, content, file, onStage }) {
    requireWallet();
    onStage?.("Publishing");
    await wait(900);
    const postId = `0xlocal${nextId++}`;
    dispatch({
      type: "addPost",
      post: {
        postId,
        parentId,
        contentId: `content-${postId}`,
        categoryId,
        postOwner: walletAddress,
        createdAt: new Date(),
        content: { title, content, image: file ? URL.createObjectURL(file) : undefined },
        votes: 0,
        voters: {},
        ...(parentId === ROOT_PARENT_ID && { acceptedReplyId: null }),
      },
    });
  }

  /** Same rules as voteUp/voteDown; returns the reputation weight the vote carried. */
  async function vote(postId, direction) {
    requireWallet();
    const post = state.posts[postId];
    if (sameAddress(post.postOwner, walletAddress)) throw new Error("You cannot vote on your own post.");
    if (post.voters[key(walletAddress)]) throw new Error("You already voted on this post.");
    const weight = voteWeight(reputationOf(state, walletAddress, post.categoryId));
    await wait(600);
    dispatch({ type: "vote", postId, direction, voter: key(walletAddress), weight });
    return weight;
  }

  /** A real native-currency transfer on the testnet; resolves to the transaction hash. */
  async function tip(receiver, valueWei) {
    requireWallet();
    // A guest identity has no wallet behind it, so it can't sign a transfer.
    if (isGuest) throw new Error("Connect a wallet to send tips.");
    if (chainId !== SUPPORTED_CHAIN.id) await switchChainAsync({ chainId: SUPPORTED_CHAIN.id });
    return sendTransactionAsync({ chainId: SUPPORTED_CHAIN.id, to: receiver, value: valueWei });
  }

  /**
   * The asker marks a reply as the accepted answer, or clicks it again to un-accept.
   * Resolves to whether it is now accepted and the reputation its author gained.
   */
  async function acceptAnswer(questionId, replyId) {
    requireWallet();
    const question = state.posts[questionId];
    if (!sameAddress(question.postOwner, walletAddress)) {
      throw new Error("Only the person who asked can accept an answer.");
    }
    const accepting = question.acceptedReplyId !== replyId;
    await wait(400);
    dispatch({ type: "accept", questionId, replyId });
    const ownAnswer = sameAddress(state.posts[replyId].postOwner, walletAddress);
    return { accepting, reward: accepting && !ownAnswer ? ACCEPT_REWARD : 0 };
  }

  return { createPost, vote, tip, acceptAnswer };
}
