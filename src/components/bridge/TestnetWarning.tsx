export function TestnetWarning() {
  return (
    <div
      className="flex items-start gap-3 rounded border border-[#EF5350] border-l-4 border-l-[#EF5350] bg-[rgba(239,83,80,0.08)] px-4 py-3"
      role="alert"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EF5350"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-0.5 shrink-0"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <p className="text-base font-normal leading-normal text-[#ffb3ae]">
        This is a testnet demo. <span className="font-semibold">Do not send real funds.</span> ETH
        locked on Sepolia can be reclaimed by reaching out to contact support.
      </p>
    </div>
  );
}
