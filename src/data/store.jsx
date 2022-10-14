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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const key = (address) => address?.toLowerCase();
const reputationOf = (state, address, categoryId) => state.reputation[key(address)]?.[categoryId] ?? 0;

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

export function usePosts(categoryId) {
  const { state } = useForum();
  const posts = useMemo(
    () =>
      Object.values(state.posts)
        .filter((post) => post.parentId === ROOT_PARENT_ID && post.categoryId === categoryId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.posts, categoryId]
  );
  return { posts, isLoading: false };
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
  const { walletAddress, chainId } = useDapp();
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
    if (chainId !== SUPPORTED_CHAIN.id) await switchChainAsync({ chainId: SUPPORTED_CHAIN.id });
    return sendTransactionAsync({ chainId: SUPPORTED_CHAIN.id, to: receiver, value: valueWei });
  }

  return { createPost, vote, tip };
}
