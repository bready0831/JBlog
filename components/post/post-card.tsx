import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function PostCard({ post }: { post: Post }) {
  const href = `/posts/${post.slug ?? post.notion_id}`;

  return (
    <>
      <Link
        href={href}
        className="group flex items-start justify-between gap-6 py-8"
      >
        <div className="flex-1 min-w-0">
          {post.category && (
            <p className="text-sm text-muted-foreground mb-2 font-display">
              {post.category}
            </p>
          )}
          <h2 className="text-2xl font-semibold mb-3 font-display group-hover:text-muted-foreground transition-colors leading-snug">
            {post.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-2 h-[3.25rem]">
            {post.description ?? ''}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {post.date && (
              <time className="text-sm text-muted-foreground/70">
                {formatDate(post.date)}
              </time>
            )}
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-sm text-muted-foreground/50">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {post.thumbnail_url && (
          <div className="relative w-48 shrink-0 overflow-hidden rounded-xl bg-muted aspect-[4/3]">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </Link>
      <Separator />
    </>
  );
}
