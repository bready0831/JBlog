import Link from "next/link";
import Container from "@/components/layout/container";
import { siteConfig } from "@/lib/site";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function VelogIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 0C1.338 0 0 1.338 0 3v18c0 1.662 1.338 3 3 3h18c1.662 0 3-1.338 3-3V3c0-1.662-1.338-3-3-3H3zm6.883 6.25c.403 0 .7.18.89.543l2.903 6.282c.27-.868.504-1.72.7-2.556.198-.835.297-1.556.297-2.16 0-.31-.054-.54-.162-.692-.107-.152-.336-.258-.687-.317a.655.655 0 0 1-.425-.236.659.659 0 0 1-.141-.424c0-.208.073-.38.22-.518.146-.138.35-.207.61-.207.52 0 1.01.212 1.466.636.458.424.687 1.035.687 1.833 0 .747-.143 1.598-.428 2.553-.286.955-.632 1.9-1.04 2.835a23.836 23.836 0 0 1-1.271 2.48c-.44.735-.85 1.103-1.231 1.103-.31 0-.567-.22-.772-.66L9.232 10.8a73.7 73.7 0 0 1-.507 2.864c-.3 1.415-.71 2.12-1.228 2.12-.165 0-.491-.123-.978-.37l-.39-.195.211-.496c.3.128.496.193.585.193.234 0 .44-.343.618-1.03.178-.685.37-1.72.574-3.104l.215-1.51c.092-.63.138-1.073.138-1.33 0-.265-.05-.453-.152-.564-.101-.11-.28-.181-.537-.21a.596.596 0 0 1-.4-.21.615.615 0 0 1-.145-.416c0-.213.076-.386.229-.519.152-.133.36-.2.623-.2l.796.031z" />
    </svg>
  );
}

const ICON_MAP = {
  Email: MailIcon,
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  Velog: VelogIcon,
} as const;

function renderTagline(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i} className="block">
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  ));
}

export default function AboutPage() {
  const { author, socials } = siteConfig;

  return (
    <Container className="pt-32 pb-20">
      {/* 상단: 태그라인 + 사진 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-8 mb-14">
        <h1 className="text-4xl sm:text-5xl font-sans font-light leading-tight break-keep">
          {renderTagline(author.tagline)}
        </h1>
      </div>

      {/* 소개글 */}
      <div className="space-y-5 mb-16">
        {author.bio.split("\n\n").map((paragraph, i) => (
          <p
            key={i}
            className="font-display text-base leading-loose text-foreground/80 break-keep"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* SNS 링크 */}
      <div className="flex items-center justify-center gap-6">
        {socials.map((social) => {
          const Icon = ICON_MAP[social.label as keyof typeof ICON_MAP];
          return (
            <Link
              key={social.label}
              href={social.url}
              target={social.label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {Icon ? (
                <Icon className="w-6 h-6" />
              ) : (
                <span className="text-sm">{social.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
