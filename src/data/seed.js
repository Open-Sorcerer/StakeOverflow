import { ROOT_PARENT_ID } from "config";

// Randomly generated addresses, so tips from the app never reach a real project's contract.
const people = {
  ada: "0xd460877117b2bb2330be666da428c664b896fc30",
  lin: "0xc142c82ce203f6fe6800790c7d0c69f359259a8c",
  ravi: "0xc371f934057d3752153fa45a8c22bf34289ed387",
  noor: "0xce1d43af9c8c1be140acd31c1fd848f97f4a0a0c",
  kai: "0x62ab9984edf0fa3d27126c72e711612d7aa34059",
  sam: "0x7a3f9c21b8e04d5f6a1c2e3b4d5f6a7b8c9d0e1f",
};

const categories = [
  { categoryId: "0xc1", category: "Solidity" },
  { categoryId: "0xc2", category: "Polygon" },
  { categoryId: "0xc3", category: "IPFS" },
  { categoryId: "0xc4", category: "Zero Knowledge" },
  { categoryId: "0xc5", category: "dApp Frontend" },
  { categoryId: "0xc6", category: "Ethereum" },
];

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000);

/** Sample threads. Content is markdown; `accepted` marks the question's accepted answer. */
const thread = [
  {
    id: "p1",
    category: "0xc2",
    owner: people.lin,
    age: 38,
    votes: 21,
    title: "Mumbai is gone. What's the cleanest migration path to Amoy?",
    content:
      "Our contract and all of its event history live on **Mumbai**. Do we redeploy and start fresh, or is there a sane way to replay state onto Amoy so reputation isn't lost?",
    replies: [
      {
        owner: people.ada,
        age: 31,
        votes: 9,
        content:
          "Redeploy, then replay:\n\n1. Index the old events once from an archive node.\n2. Seed the new contract through an owner-only `migrate()`.\n3. Renounce ownership afterwards.\n\nCheaper than it sounds on Amoy.",
      },
      {
        owner: people.kai,
        age: 12,
        votes: 4,
        content:
          "If you only need reputation, snapshot it into a **Merkle root** and let people claim it. You skip writing thousands of storage slots yourself.",
      },
    ],
  },
  {
    id: "p2",
    category: "0xc1",
    owner: people.ravi,
    age: 95,
    votes: 14,
    title: "abi.encode vs abi.encodePacked when hashing post IDs: is collision a real risk?",
    content:
      "I derive post IDs like this:\n\n```solidity\nbytes32 postId = keccak256(abi.encodePacked(owner, parentId, contentId));\n```\n\nAll three are fixed-size. Is `encodePacked` actually safe here, or should I switch to `abi.encode` anyway?",
    replies: [
      {
        owner: people.noor,
        age: 70,
        votes: 11,
        accepted: true,
        content:
          "With only fixed-size types, `encodePacked` can't collide: there's no ambiguity about where one field ends. The danger is two **dynamic** types side by side:\n\n```solidity\n// \"ab\" + \"c\" and \"a\" + \"bc\" pack to the same bytes\nkeccak256(abi.encodePacked(stringA, stringB));\n```\n\nYour case is fine.",
      },
    ],
  },
  {
    id: "p3",
    category: "0xc4",
    owner: people.noor,
    age: 260,
    votes: 17,
    title: "Can reputation be proven without revealing which wallet earned it?",
    content:
      'I want users to prove "I have 50+ reputation in Solidity" to unlock a role, without linking their main wallet. Semaphore-style group membership, or something lighter?',
    replies: [
      {
        owner: people.ada,
        age: 200,
        votes: 6,
        content:
          "Publish a Merkle tree of `(commitment, reputationBucket)` per epoch. A Semaphore proof of membership in the 50+ bucket gives you exactly that, and the **nullifier** stops double-claims.",
      },
    ],
  },
  {
    id: "p4",
    category: "0xc3",
    owner: people.kai,
    age: 410,
    votes: 11,
    title: "Pinning strategy for user images that must stay available for years",
    content:
      "Right now uploads are pinned by a single provider. If they go away, every image in old posts breaks. How are people handling long-term availability?",
    replies: [],
  },
  {
    id: "p5",
    category: "0xc5",
    owner: people.sam,
    age: 22,
    votes: 4,
    title: "Optimistic UI for transactions that take 10+ seconds to confirm",
    content:
      "Showing a spinner for the whole confirmation feels broken. Is it reasonable to render the post immediately in a pending state and reconcile once the event is indexed?",
    replies: [
      {
        owner: people.lin,
        age: 9,
        votes: 3,
        accepted: true,
        content:
          'Yes. Key the pending item by tx hash, then swap it for the indexed row when the event lands:\n\n```js\nconst hash = await writeContractAsync(request);\naddPending({ hash, ...draft });\n\nawait waitForTransactionReceipt(config, { hash });\nremovePending(hash);\n```\n\nShow a quiet "confirming" badge rather than a blocking spinner.',
      },
    ],
  },
  {
    id: "p6",
    category: "0xc1",
    owner: people.kai,
    age: 1440,
    votes: 6,
    title: "Why does voteDown let me vote on my own post when voteUp doesn't?",
    content:
      "`voteUp` has this check:\n\n```solidity\nrequire(postRegistry[_postId].postOwner != _voter, \"you cannot vote your own posts\");\n```\n\nbut `voteDown` doesn't. Is that intentional, a way to retract your own answer?",
    replies: [],
  },
  {
    id: "p7",
    category: "0xc6",
    owner: people.ada,
    age: 3000,
    votes: 8,
    title: "Handling accountsChanged mid-session without a full reload",
    content:
      'When a user switches accounts in their wallet, my cached "already voted" state still belongs to the old address. What\'s the clean pattern here?',
    replies: [
      {
        owner: people.ravi,
        age: 2900,
        votes: 5,
        accepted: true,
        content:
          "Derive per-user state from the address instead of storing it. Key queries by the **lowercased** address and everything recomputes on its own:\n\n```js\nconst { address } = useAccount();\nconst myVote = votes[address?.toLowerCase()];\n```",
      },
    ],
  },
];

/** Reputation a newly connected wallet or guest starts with in each topic, so the sidebar isn't empty. */
export const VIEWER_REPUTATION = { "0xc1": 12, "0xc2": 3, "0xc5": 7 };

/** Sample authors' reputation per topic, so their profiles aren't empty. */
const AUTHOR_REPUTATION = {
  [people.ada]: { "0xc1": 41, "0xc4": 18, "0xc2": 9, "0xc6": 6 },
  [people.lin]: { "0xc2": 26, "0xc5": 14 },
  [people.ravi]: { "0xc1": 22, "0xc6": 15 },
  [people.noor]: { "0xc1": 33, "0xc4": 27 },
  [people.kai]: { "0xc3": 19, "0xc2": 11, "0xc1": 4 },
  [people.sam]: { "0xc5": 8 },
};

export function createSeedState() {
  const posts = {};
  thread.forEach((question) => {
    const postId = `0x${question.id}`;
    const acceptedIndex = question.replies.findIndex((reply) => reply.accepted);
    posts[postId] = {
      postId,
      parentId: ROOT_PARENT_ID,
      contentId: `content-${postId}`,
      categoryId: question.category,
      postOwner: question.owner,
      createdAt: minutesAgo(question.age),
      content: { title: question.title, content: question.content },
      votes: question.votes,
      voters: {},
      acceptedReplyId: acceptedIndex >= 0 ? `${postId}r${acceptedIndex}` : null,
    };
    question.replies.forEach((reply, index) => {
      const replyId = `${postId}r${index}`;
      posts[replyId] = {
        postId: replyId,
        parentId: postId,
        contentId: `content-${replyId}`,
        categoryId: question.category,
        postOwner: reply.owner,
        createdAt: minutesAgo(reply.age),
        content: { content: reply.content },
        votes: reply.votes,
        voters: {},
      };
    });
  });

  const reputation = {};
  Object.entries(AUTHOR_REPUTATION).forEach(([address, byTopic]) => {
    reputation[address.toLowerCase()] = { ...byTopic };
  });

  // Per-address, per-topic reputation.
  return { categories, posts, reputation };
}

/** A handful of questions for the landing page preview. */
export const showcase = thread.slice(0, 3).map((question) => ({
  title: question.title,
  owner: question.owner,
  votes: question.votes,
  replies: question.replies.length,
  category: categories.find((c) => c.categoryId === question.category).category,
}));

export const seedCategories = categories;
