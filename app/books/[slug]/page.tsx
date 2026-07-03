import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import PostContent from "@/components/post/post-content";
import Link from "next/link";
import { getBook } from "@/lib/books";
import { getPostsBySlugs } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return {};
  return { title: book.title };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const date = book.date ? formatDate(book.date, { month: "long" }) : null;
  const relatedPosts = await getPostsBySlugs(book.related_post_slugs ?? []);

  return (
    <div className="pt-24 pb-20 grid grid-cols-[1fr_min(48rem,100%)_1fr]">
      {/* 왼쪽 여백 */}
      <div />

      {/* 본문 */}
      <div className="px-6">
        {book.thumbnail_url && (
          <div className="relative w-36 aspect-5/7 overflow-hidden rounded-md shadow-[4px_4px_8px_rgba(0,0,0,0.15)] mb-8">
            <Image
              src={book.thumbnail_url}
              alt={book.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight mb-3 font-display leading-snug">
          {book.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
          {book.category && <span>{book.category}</span>}
          {book.category && date && <span>·</span>}
          {date && <time>{date}</time>}
          {book.status && (
            <>
              <span>·</span>
              <span
                className={
                  book.status === "완료"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {book.status === "완료" ? "읽음" : "읽는 중"}
              </span>
            </>
          )}
        </div>

        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground/60 bg-muted px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Separator className="mb-12" />

        {book.content ? (
          <PostContent content={book.content} />
        ) : (
          <p className="text-muted-foreground">내용이 없습니다.</p>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Related Posts
            </h2>
            <ul className="space-y-3">
              {relatedPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.slug ?? post.notion_id}`}
                    className="group flex items-start gap-3"
                  >
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                    <div>
                      <p className="font-display font-medium group-hover:text-muted-foreground transition-colors leading-snug">
                        {post.title}
                      </p>
                      {post.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 오른쪽 여백 */}
      <div />
    </div>
  );
}
