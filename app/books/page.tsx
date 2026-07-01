import { Metadata } from "next";
import Container from "@/components/layout/container";
import BookCard from "@/components/book/book-card";
import { getAllBooks } from "@/lib/books";

export const metadata: Metadata = { title: "Books" };

export default async function BooksPage() {
  const books = await getAllBooks();

  return (
    <Container className="pt-24 pb-20">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-wide mb-4 font-display">
          Books
        </h1>
        <div className="w-10 h-0.5 bg-foreground mx-auto" />
      </header>

      {books.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          아직 읽은 책이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-4 pr-2">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </Container>
  );
}
