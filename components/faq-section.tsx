"use client";

import { useState } from "react";
import { FiPlus, FiMinus, FiArrowUpRight } from "react-icons/fi";

const faqs = [
  {
    question: "C'est quoi FripCash ?",
    answer:
      "FripCash est une plateforme de vente et d'achat d'articles de seconde main. Tu peux vendre tes vêtements, accessoires, chaussures et bien plus encore facilement et en toute sécurité.",
  },
  {
    question: "Comment commencer à vendre ?",
    answer:
      "C'est simple ! Crée ton compte, prends des photos de ton article, ajoute un titre et une description, fixe ton prix, et publie. Les acheteurs te contacteront directement.",
  },
  {
    question: "Est-ce que les paiements sont sécurisés ?",
    answer:
      "Oui, tous les paiements passent par notre système sécurisé. L'argent est protégé jusqu'à ce que l'acheteur confirme la réception de l'article en bon état.",
  },
  {
    question: "Puis-je utiliser FripCash sur mon téléphone ?",
    answer:
      "Absolument ! FripCash est entièrement responsive et fonctionne parfaitement sur mobile, tablette et ordinateur. Une application mobile est aussi en cours de développement.",
  },
  {
    question: "Y a-t-il des frais de service ?",
    answer:
      "La publication d'articles est gratuite. Une petite commission est prélevée uniquement lors d'une vente réussie pour couvrir les frais de paiement sécurisé et de protection acheteur.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-foreground pr-4">
          {question}
        </span>
        <span className="flex items-center justify-center h-8 w-8 rounded-full border border-border shrink-0">
          {open ? (
            <FiMinus className="h-4 w-4 text-foreground" />
          ) : (
            <FiPlus className="h-4 w-4 text-foreground" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left side — heading + contact card */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            FAQ
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Des{" "}
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
              Questions ?
            </span>
          </h2>

          <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-md">
            On est là pour simplifier ton expérience. Explore nos FAQ pour
            trouver rapidement les infos dont tu as besoin sur FripCash.
          </p>

          {/* Contact card */}
          <div className="mt-10 rounded-lg border border-border p-6">
            <h3 className="text-base font-semibold text-foreground">
              Tu as encore une question ?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              On est là pour t&apos;aider. Si tu as besoin de plus
              d&apos;informations, n&apos;hésite pas à nous contacter !
            </p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Poser une question
              <FiArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right side — accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
