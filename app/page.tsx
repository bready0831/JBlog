import Link from "next/link";
import Container from "@/components/layout/container";
import PostCard from "@/components/post/post-card";
import BookCarousel from "@/components/book/book-carousel";
import { getRecentPosts } from "@/lib/posts";
import { getRecentBooks } from "@/lib/books";

export default async function HomePage() {
  const [posts, books] = await Promise.all([
    getRecentPosts(5),
    getRecentBooks(10),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative hero-grid flex flex-col items-center justify-center text-center px-6 pt-40 pb-16">
        <h1 className="text-5xl font-semibold tracking-wide mb-4 font-display">
          Bready Library
        </h1>
        <p className="text-muted-foreground text-base mb-6">개발과 사유의 기록.</p>
        <p className="text-xs tracking-widest text-muted-foreground/60 uppercase">
          Backend · Frontend · Essay · Insight
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-b from-transparent to-background" />
      </section>

      {/* Books Carousel */}
      {books.length > 0 && (
        <Container className="pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-display">Books</h2>
            <Link
              href="/books"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </div>
          <BookCarousel books={books} />
        </Container>
      )}

      {/* Recent Posts */}
      <Container className="pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold font-display">Recent Posts</h2>
          <Link
            href="/posts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">
            아직 작성된 글이 없습니다.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </Container>
    </>
  );
}
