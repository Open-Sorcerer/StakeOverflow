/** Hairline icon set (24px grid, 1.5 stroke). */
const paths = {
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowDown: <path d="M12 5v14m-6-6 6 6 6-6" />,
  chevronUp: <path d="m6 14.5 6-6 6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6.5 6.5l11 11m0-11-11 11" />,
  reply: (
    <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5-1.2 0-2.4-.2-3.4-.6L4 20l1.3-3.6C4.5 15.3 4 14 4 12.5 4 8.9 7.6 6 12 6s8 2.9 8 6.5Z" />
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.6 9.4c-.4-.8-1.4-1.4-2.6-1.4-1.6 0-2.7.9-2.7 2 0 2.6 5.6 1.4 5.6 4 0 1.1-1.2 2-2.9 2-1.3 0-2.4-.6-2.8-1.5M12 6.5V8m0 8v1.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m20.5 15.5-4.6-4.6a1.5 1.5 0 0 0-2.1 0L5 19.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  external: <path d="M14 4.5h5.5V10m0-5.5L11 13m-1.5-7H7a2.5 2.5 0 0 0-2.5 2.5V17A2.5 2.5 0 0 0 7 19.5h8.5A2.5 2.5 0 0 0 18 17v-2.5" />,
  logout: <path d="M14.5 8V6a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M10 12h10m-3-3 3 3-3 3" />,
  wallet: (
    <>
      <path d="M4.5 8.5A2.5 2.5 0 0 1 7 6h9.5v2.5" />
      <rect x="4.5" y="8.5" width="15" height="10.5" rx="2.5" />
      <path d="M15.5 13.75h1.5" />
    </>
  ),
  loader: <path d="M12 4a8 8 0 1 0 8 8" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.2-3.2 3.9-5 7-5s5.8 1.8 7 5" />
    </>
  ),
  send: <path d="M5 12h13m-5-5 5 5-5 5" />,
  github: (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  ),
};

function Icon({ name, size = 18, strokeWidth = 1.5, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
