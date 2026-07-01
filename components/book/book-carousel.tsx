"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Book } from "@/lib/types";

function CarouselCard({ book }: { book: Book }) {
  const href = `/books/${book.slug ?? book.notion_id}`;

  return (
    <Link href={href} className="block">
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-md bg-muted shadow-[4px_4px_8px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-2">
        {book.thumbnail_url ? (
          <Image
            src={book.thumbnail_url}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </div>
    </Link>
  );
}

export default function BookCarousel({ books }: { books: Book[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  return (
    <div className="space-y-4">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true }}
        plugins={[WheelGesturesPlugin()]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-3 pr-3">
          {books.map((book) => (
            <CarouselItem key={book.id} className="pl-4 basis-40">
              <CarouselCard book={book} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* 스크롤 인디케이터 */}
      <div className="flex gap-1.5 justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-foreground"
                : "w-1.5 bg-muted-foreground/30"
            }`}
            aria-label={`${i + 1}번째 슬라이드`}
          />
        ))}
      </div>
    </div>
  );
}
