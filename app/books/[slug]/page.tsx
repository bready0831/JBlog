import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import PostContent from "@/components/post/post-content";
import { getBook } from "@/lib/books";
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

  return (
    <div className="pt-24 pb-20 grid grid-cols-[1fr_min(48rem,100%)_1fr]">
      {/* 왼쪽 여백 — sticky 이미지 */}
      <div className="hidden xl:block">
        {book.thumbnail_url && (
          <div className="sticky top-28 w-44 ml-auto mr-8">
            <div className="relative aspect-[5/7] w-full overflow-hidden rounded-md shadow-[4px_4px_8px_rgba(0,0,0,0.15)]">
              <Image
                src={book.thumbnail_url}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="px-6">
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
      </div>

      {/* 오른쪽 여백 */}
      <div />
    </div>
  );
}
