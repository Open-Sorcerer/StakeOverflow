/**
 * base64-encodes a JSON payload as UTF-8. Plain `btoa(JSON.stringify(x))`
 * throws on anything outside Latin-1 (emoji, curly quotes, non-English text).
 */
export const encodeJsonBase64 = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const resolveIpfs = (url) => {
  if (!url || !url.startsWith("ipfs://")) return url;
  return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
};

export const sameAddress = (a, b) =>
  Boolean(a && b) && a.toLowerCase() === b.toLowerCase();

/** "2h ago" style relative time. */
export const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(date)) / 1000));
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, size] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
};
