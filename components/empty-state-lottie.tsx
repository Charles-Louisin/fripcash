"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const LOTTIE_URL =
  "https://lottie.host/3bc6cc5b-4c4c-4ac8-9eb4-c2fbe17b0eee/Ifcy1stOpe.json";

export function EmptyStateLottie({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) {
    return (
      <div
        className={className}
        style={{ width: "100%", height: "100%", ...style }}
      />
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
    />
  );
}
