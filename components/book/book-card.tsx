import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";

export default function BookCard({ book }: { book: Book }) {
  const href = `/books/${book.slug ?? book.notion_id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-5/7 w-full overflow-hidden rounded-md bg-muted shadow-[4px_4px_8px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-2">
        {book.thumbnail_url ? (
          <Image
            src={book.thumbnail_url}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm px-4 text-center">
              {book.title}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2 font-display">
          {book.title}
        </p>
        {book.category && (
          <p className="text-xs text-muted-foreground">{book.category}</p>
        )}
        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground/60">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
