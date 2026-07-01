import { Metadata } from "next";
import Container from "@/components/layout/container";
import PostCard from "@/components/post/post-card";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Posts" };

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <Container className="pt-24 pb-20">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-wide mb-4 font-display">
          Posts
        </h1>
        <div className="w-10 h-0.5 bg-foreground mx-auto" />
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </Container>
  );
}
