"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/stores/ui-store";
import { FiArrowRight } from "react-icons/fi";

interface PostCardProps {
  title: string;
  body: string;
  id: number;
}

export function PostCard({ title, body, id }: PostCardProps) {
  const openSheet = useUIStore((state) => state.openSheet);

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardDescription className="text-xs font-medium text-muted-foreground">
          Post #{id}
        </CardDescription>
        <CardTitle className="text-base leading-snug line-clamp-2 capitalize">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {body}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-0 text-primary hover:text-primary/80"
          onClick={() => openSheet("details")}
        >
          View details
          <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  );
}
