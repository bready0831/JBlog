import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import PostContent from "@/components/post/post-content";
import Container from "@/components/layout/container";
import { getPost } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.description ?? undefined };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = post.date ? formatDate(post.date, { month: "long" }) : null;

  return (
    <Container className="pt-24 pb-20">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-3 font-display">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          )}
          {date && (
            <time className="text-sm text-muted-foreground mt-3 block">
              {date}
            </time>
          )}
        </header>

        <Separator className="mb-8" />

        {post.thumbnail_url && (
          <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl mb-10">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.content ? (
          <PostContent content={post.content} />
        ) : (
          <p className="text-muted-foreground">내용이 없습니다.</p>
        )}
      </article>
    </Container>
  );
}
