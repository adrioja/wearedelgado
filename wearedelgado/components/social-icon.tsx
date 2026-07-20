import type { SocialIconKey } from "@/lib/data/social-links";

const paths: Record<SocialIconKey, React.ReactNode> = {
  instagram: (
    <path
      d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm6.25-.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
    />
  ),
  linkedin: (
    <path
      d="M6.5 9v9M6.5 6.01V6M11 18v-5.5c0-1.5 1-3 3-3s3 1.5 3 3V18M11 9v9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  ),
  behance: (
    <path
      d="M4 8h6a2.5 2.5 0 0 1 0 5H4V8Zm0 5h6.5a2.5 2.5 0 0 1 0 5H4v-5ZM15 11.5c0-1.4 1.2-2.5 3-2.5s3 1.1 3 2.5v.5h-5c0 1.2.8 2 2 2 .8 0 1.4-.3 1.8-.8M15.5 8h4"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path
        d="M5 9.5c4 1.3 9 1.3 13.5-.3M4.7 14.8c4.7-1.2 9-.6 12.5 2.3M9 4.3c2.7 3.4 4 8 3.6 15"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  x: (
    <path
      d="M5 5l14 14M19 5 5 19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  ),
  youtube: (
    <>
      <rect x="3.5" y="6.5" width="17" height="11" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M10.5 9.75v4.5l4-2.25-4-2.25Z" fill="currentColor" />
    </>
  ),
  tiktok: (
    <path
      d="M13.5 4v9.7a2.8 2.8 0 1 1-2.2-2.73M13.5 4a4.2 4.2 0 0 0 4 4.2"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
  ),
  pinterest: (
    <path
      d="M9.5 19c.5-1.5 1.5-5.3 1.5-5.3M12 8.5c2 0 3.5 1.3 3.5 3.2 0 2.3-1.2 4.3-3.2 4.3-1 0-1.7-.6-1.9-1.2M12 6.5a5.5 5.5 0 1 0 0 11"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
      strokeLinecap="round"
    />
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path
        d="M4 12h16M12 4c2.2 2.2 3.3 5 3.3 8s-1.1 5.8-3.3 8c-2.2-2.2-3.3-5-3.3-8s1.1-5.8 3.3-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </>
  ),
};

export function SocialIcon({ iconKey }: { iconKey: SocialIconKey }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      {paths[iconKey] ?? paths.website}
    </svg>
  );
}
