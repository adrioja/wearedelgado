type DownloadLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function DownloadLink({ href, children, className = "" }: DownloadLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex cursor-pointer items-center gap-2 text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <span className="relative">
        {children}
        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 shrink-0 text-accent transition-transform duration-300 ease-out group-hover:translate-y-0.5"
      >
        <path
          d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
