import { Button } from "./ui/button";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
      <p>&copy; {currentYear} All rights reserved</p>
      <p className="flex items-center gap-1">
        A fun project made with{" "}
        <HeartIcon className="text-rose-400 fill-rose-400 size-4" />.
      </p>
      <Button asChild variant="ghost" className="mt-2 sm:mt-0">
        <Link
          href="https://github.com/grimmy-dev/assessment2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
        >
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-brand-github"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </div>
        </Link>
      </Button>
    </footer>
  );
};

export default Footer;
