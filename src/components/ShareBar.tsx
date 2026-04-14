import React, { useState } from "react";
import "../styles/components/share-bar.css";

declare const umami: { track: (event: string, data?: Record<string, string>) => void };

interface ShareBarProps {
  postTitle: string;
}

const trackShare = (platform: string) => {
  try {
    const slug = typeof window !== "undefined" ? window.location.pathname : "";
    umami.track("share", { platform, slug });
  } catch {
    /* umami not loaded */
  }
};

const ShareBar: React.FC<ShareBarProps> = ({ postTitle }) => {
  const [copied, setCopied] = useState(false);

  const getPageUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPageUrl());
      trackShare("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleLinkedIn = () => {
    trackShare("linkedin");
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPageUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleX = () => {
    trackShare("x");
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getPageUrl())}&text=${encodeURIComponent(postTitle)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleThreads = () => {
    trackShare("threads");
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${postTitle} ${getPageUrl()}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="share-bar">
      <button
        className={`share-btn${copied ? " share-copied" : ""}`}
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        <span className="share-tooltip">{copied ? "Copied!" : "Copy link"}</span>
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      <button className="share-btn" onClick={handleLinkedIn} aria-label="Share on LinkedIn">
        <span className="share-tooltip">LinkedIn</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>

      <button className="share-btn" onClick={handleX} aria-label="Share on X">
        <span className="share-tooltip">X</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      <button className="share-btn" onClick={handleThreads} aria-label="Share on Threads">
        <span className="share-tooltip">Threads</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.243 1.33-3.023.88-.744 2.084-1.168 3.59-1.264 1.078-.069 2.089.009 3.025.23a4.7 4.7 0 0 0-.16-1.478c-.349-1.12-1.206-1.692-2.552-1.704h-.032c-.989.007-1.858.343-2.439.943l-1.49-1.38c.891-.92 2.17-1.438 3.6-1.46h.056c1.982.02 3.442.834 4.217 2.355.35.687.564 1.49.642 2.382.65.26 1.242.59 1.77.989l.009.007c1.17.882 1.98 2.079 2.335 3.468.458 1.785.197 3.895-1.455 5.55C18.2 22.748 15.834 23.97 12.186 24zm-1.638-8.904c-1.2.077-2.076.467-2.53.89-.394.366-.56.79-.533 1.271.039.703.484 1.97 2.843 1.97.136 0 .278-.005.425-.014 1.14-.063 2.008-.473 2.58-1.218.498-.648.84-1.558.99-2.702-.81-.2-1.71-.3-2.69-.3-.36 0-.72.02-1.085.053v.05z" />
        </svg>
      </button>
    </div>
  );
};

export default ShareBar;
