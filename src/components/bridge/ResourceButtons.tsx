import { ARTICLE_URL, DOCS_VIEWER_URL, PDF_VIEWER_URL } from "@/lib/links";

const buttonClass =
  "inline-flex items-center gap-2 rounded-[4px] border border-[#3a4650] bg-transparent px-4 py-2 text-sm font-semibold text-[#e4ebf0] whitespace-nowrap transition-colors hover:border-[#ffb3ae]";

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ResourceButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={PDF_VIEWER_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <svg {...iconProps}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
        </svg>
        Read PDF
      </a>
      <a href={DOCS_VIEWER_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <svg {...iconProps}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
          <path d="M8.5 12h7M8.5 15.5h7M8.5 18h4" />
        </svg>
        Read Docs
      </a>
      <a href={ARTICLE_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <svg {...iconProps}>
          <path d="M4 5h16v14H4z" />
          <path d="M7 9h6M7 12.5h10M7 16h7" />
        </svg>
        Read Article
      </a>
    </div>
  );
}
