import { ARTICLE_URL, DOCS_VIEWER_URL, PDF_VIEWER_URL } from "@/lib/links";

const ghostButtonClass =
  "inline-flex items-center gap-2 rounded-[4px] border border-[#3a4650] bg-transparent px-4 py-2 text-sm font-semibold text-[#e4ebf0] whitespace-nowrap transition-colors hover:border-[#ffb3ae]";

const accentButtonClass =
  "inline-flex items-center gap-2 rounded-[4px] bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground whitespace-nowrap transition-colors hover:bg-accent/90";

export function ResourceButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={PDF_VIEWER_URL} target="_blank" rel="noopener noreferrer" className={accentButtonClass}>
        Read PDF
      </a>
      <a href={DOCS_VIEWER_URL} target="_blank" rel="noopener noreferrer" className={accentButtonClass}>
        Read Docs
      </a>
      <a href={ARTICLE_URL} target="_blank" rel="noopener noreferrer" className={accentButtonClass}>
        Read Article
      </a>
    </div>
  );
}

