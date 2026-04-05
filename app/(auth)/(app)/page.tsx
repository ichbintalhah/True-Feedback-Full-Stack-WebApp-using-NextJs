"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import messages from "@/messages.json";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type FeedbackMessage = {
  title: string;
  content: string;
  received: string;
};

export default function Home() {
  const feedbackMessages = messages as FeedbackMessage[];

  return (
    <>
      <main className="grow px-4 py-10 sm:px-6 md:px-10 lg:px-16">
        <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-3xl border border-slate-300/60 bg-white/80 p-6 shadow-lg shadow-sky-100/50 backdrop-blur-sm md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div className="animate-fade-up">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Anonymous feedback, thoughtfully delivered
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Better feedback starts with a safer conversation.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
              TrueFeedback helps people share honest thoughts without pressure.
              Create a personal link, receive anonymous messages, and improve
              with clarity.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-10 bg-sky-700 px-5 text-white hover:bg-sky-800"
              >
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 border-slate-300 bg-white px-5 text-slate-800 hover:border-slate-400 hover:bg-slate-50"
              >
                <Link href="/sign-in">Log In</Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-linear-to-br from-sky-50 to-emerald-50 p-5 animate-drift">
            <div className="absolute -top-2 right-3 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-800">
              Live
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              How it works
            </p>
            <ol className="mt-3 space-y-3 text-sm text-slate-700">
              <li>1. Create your profile and share your unique URL.</li>
              <li>2. People leave anonymous feedback in a guided form.</li>
              <li>3. Review messages privately from your dashboard.</li>
            </ol>
            <p className="mt-5 text-xs text-slate-600">
              Tip: meaningful prompts appear while someone is writing to help
              them leave quality feedback.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-5xl animate-fade-up">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Recent anonymous notes
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              A preview of what thoughtful feedback looks like
            </p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {feedbackMessages.map((message, index) => (
                <CarouselItem key={index} className="p-2 md:basis-1/2">
                  <Card className="h-full border-slate-200/80 bg-white/90 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        {message.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-sky-700" />
                      <div>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {message.content}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {message.received}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100" />
            <CarouselNext className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100" />
          </Carousel>
        </section>
      </main>

      <footer className="border-t border-slate-300/60 bg-white/80 px-4 py-5 text-center text-xs text-slate-600 sm:text-sm">
        <p>
          © 2026 TrueFeedback. Crafted for clearer conversations.
          <span className="ml-2 opacity-35 transition-opacity hover:opacity-85">
            Built by Talha
          </span>
        </p>
      </footer>
    </>
  );
}
