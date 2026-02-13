"use client";

import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  /** Pass a changing key to re-trigger the animation */
  animationKey?: string | number;
}

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  onAnimationComplete,
  stepDuration = 0.35,
  animationKey = 0,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const hasTriggered = useRef(false);

  // Reset animation state when animationKey or text changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimate(false);
    hasTriggered.current = false;
    // Small delay to let the browser reset styles before re-animating
    const t = setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setAnimate(true);
          hasTriggered.current = true;
        }
      }
    }, 50);
    return () => clearTimeout(t);
  }, [animationKey, text]);

  // Intersection observer for initial scroll-based trigger
  useEffect(() => {
    if (!ref.current || hasTriggered.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          setAnimate(true);
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, animationKey]);

  // Fire onAnimationComplete after all words finish
  useEffect(() => {
    if (!animate) return;
    const totalTime = (elements.length - 1) * delay + stepDuration * 2 * 1000;
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, totalTime);
    return () => clearTimeout(timer);
  }, [animate, elements.length, delay, stepDuration, onAnimationComplete]);

  const yOffset = direction === "top" ? -30 : 30;

  return (
    <p ref={ref} className={className} style={{ overflow: "hidden" }}>
      {elements.map((segment, index) => (
        <span
          key={`${animationKey}-${index}`}
          style={{
            display: "inline-block",
            filter: animate ? "blur(0px)" : "blur(10px)",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : `translateY(${yOffset}px)`,
            transition: `filter ${stepDuration * 2}s ease, opacity ${stepDuration * 2}s ease, transform ${stepDuration * 2}s ease`,
            transitionDelay: `${(index * delay) / 1000}s`,
            willChange: "transform, filter, opacity",
          }}
        >
          {segment === " " ? "\u00A0" : segment}
          {animateBy === "words" && index < elements.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}
