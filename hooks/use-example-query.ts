import { useQuery } from "@tanstack/react-query";

/**
 * Example TanStack Query hook.
 *
 * Recommended pattern:
 *   - Use the data directly from useQuery in your components
 *   - Do NOT sync this data into Zustand
 *   - Use isLoading + Skeleton components for loading UI
 *   - Use isError + error for error UI
 */

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=6");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}

async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPost(id),
    enabled: id > 0,
  });
}
