"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/container";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="absolute top-0 left-0 right-0 z-10 py-5">
      <Container className="flex justify-end">
        <nav className="flex items-center gap-8">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-display transition-colors",
                pathname === href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
