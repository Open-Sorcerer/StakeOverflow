/**
 * Every forum read and write goes through these hooks. Today they are backed by
 * an in-memory store (./store); once the contract is redeployed, a contract-backed
 * implementation of the same set slots in here without touching the UI.
 */
export {
  ForumProvider,
  useCategories,
  usePosts,
  useReplies,
  usePostContent,
  usePostVotes,
  useReputation,
  useForumActions,
} from "./store";
