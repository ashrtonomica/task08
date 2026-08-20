import { ARTICLE_URL, DOCS_VIEWER_URL, PDF_VIEWER_URL } from "@/lib/links";

const REPO = "https://github.com/0xDarkSeidBull/daotask8";

const iconClass =
  "text-[#93a4ae] transition-colors hover:text-[#ffb3ae]";

export function FooterLinks() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <a
        href="https://redbelly-dao-taskboard.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex"
      >
        <img
          src="/dao-logo-on-dark.png"
          alt="Redbelly DAO"
          className="h-9 w-auto object-contain"
        />
      </a>

      <div className="flex items-center gap-4">
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          className={iconClass}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.28 3.4.98.1-.76.4-1.28.73-1.57-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
          </svg>
        </a>

        <a
          href={PDF_VIEWER_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Technical guide PDF"
          className={iconClass}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v5h5" />
          </svg>
        </a>

        <a
          href={DOCS_VIEWER_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Technical guide document"
          className={iconClass}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v5h5" />
            <path d="M8.5 12h7M8.5 15.5h7M8.5 18h4" />
          </svg>
        </a>

        <a
          href={ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dev.to article"
          className={iconClass}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.5 3.5h19A1.5 1.5 0 0 1 23 5v14a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 1 19V5a1.5 1.5 0 0 1 1.5-1.5Zm3.1 5.2v6.6h1.7c1.3 0 2-.8 2-2.3v-2c0-1.5-.7-2.3-2-2.3H5.6Zm1.3 1.2h.4c.5 0 .7.3.7 1.1v2c0 .8-.2 1.1-.7 1.1h-.4v-4.2Zm3.9-1.2 1.5 6.6h1.4l1.5-6.6h-1.3l-.9 4.7-.9-4.7h-1.3Zm5.3 0v6.6h3.3v-1.2h-2v-1.5h1.7v-1.2h-1.7v-1.5h2V8.7h-3.3Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
