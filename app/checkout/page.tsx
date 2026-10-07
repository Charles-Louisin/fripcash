"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppSheet } from "@/components/app-sheet";
import { CheckoutFlow } from "@/components/checkout-flow";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppSheet />
      <main className="flex-1">
        <CheckoutFlow />
      </main>
      <Footer />
    </div>
  );
}
