"use client";

import { usePosts } from "@/hooks/use-example-query";
import { PostCard, PostCardSkeleton } from "@/components/post-card";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

/**
 * Posts Feed — demonstrates the recommended TanStack Query pattern:
 *   - Data comes directly from useQuery (NOT synced into Zustand)
 *   - Loading state uses Skeleton components
 *   - Error state is handled inline
 */
export function PostsFeed() {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <FiAlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Failed to load posts</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || "Something went wrong"}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))
        : posts?.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              body={post.body}
            />
          ))}
    </div>
  );
}
