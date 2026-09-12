"use client";

import { useState } from "react";
import { MdOutlineFormatQuote } from "react-icons/md";
import { IoStarSharp, IoStarHalfSharp } from "react-icons/io5";
import { useTopReviews } from "@/hooks/use-reviews";

type Testimonial = {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  rating: number;
};

function mapReviewToTestimonial(review: any): Testimonial {
  const user = review.user;
  return {
    id: review._id,
    name:
      user?.pseudo ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      review.author ||
      "Utilisateur",
    title: "Membre FripCash",
    description: `"${review.comment}"`,
    image: user?.avatar || "",
    rating: review.rating,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;
          const isFull = rating >= starValue;

          if (isHalf) {
            return (
              <IoStarHalfSharp
                key={index}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            );
          } else if (isFull) {
            return (
              <IoStarSharp
                key={index}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            );
          } else {
            return (
              <IoStarSharp
                key={index}
                className="w-4 h-4 fill-gray-300 text-gray-300"
              />
            );
          }
        })}
      </div>
      <span className="text-sm font-semibold text-foreground ml-1">
        {rating}
      </span>
    </div>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <div className="p-5 bg-muted/50 rounded-2xl relative shrink-0">
      {/* Stars */}
      <StarRating rating={testimonial.rating} />

      {/* Quote */}
      <div className="mt-4 mb-6">
        <p className="font-semibold text-base sm:text-lg leading-snug text-foreground">
          {testimonial.description}
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {testimonial.name[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-foreground">
            {testimonial.name}
          </p>
          <p className="text-xs text-muted-foreground">{testimonial.title}</p>
        </div>
      </div>

      {/* Quote icon — bottom right */}
      <div className="absolute -right-1 -bottom-1 bg-background p-1.5 rounded-full">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white">
          <MdOutlineFormatQuote className="text-xl" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);
  const { data: rawReviews = [] } = useTopReviews();
  const testimonials = rawReviews.map(mapReviewToTestimonial);

  if (testimonials.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 overflow-hidden">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Témoignages
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Ce que nos utilisateurs{" "}
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
            disent
          </span>{" "}
          de nous
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left — featured large testimonial */}
        <div className="relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[550px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop"
            alt="Shopping"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <IoStarSharp
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-white font-semibold text-lg sm:text-xl leading-snug max-w-sm">
              &quot;{testimonials[0]?.description.replace(/"/g, "") || "Nos utilisateurs nous font confiance pour acheter et vendre chaque jour."}&quot;
            </p>
            <p className="text-white/70 text-sm mt-3">
              {testimonials[0]?.name || "Communauté FripCash"}
            </p>
          </div>
        </div>

        {/* Right — scrolling testimonials */}
        <div
          className="relative h-[400px] lg:h-[550px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-20 z-10 pointer-events-none bg-gradient-to-b from-background to-transparent" />

          {/* Scrolling container */}
          <div className="h-full overflow-hidden">
            <div
              className="flex flex-col gap-4"
              style={{
                animation: "scroll-vertical 25s linear infinite",
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {/* First set */}
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
              {/* Duplicate for seamless loop */}
              {testimonials.map((t) => (
                <TestimonialCard key={`dup-${t.id}`} testimonial={t} />
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
