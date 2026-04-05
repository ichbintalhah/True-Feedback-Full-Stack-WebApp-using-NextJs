"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import messages from "@/messages.json";

type FeedbackMessage = {
  title: string;
  content: string;
  received: string;
};

export default function Home() {
  const { data: session } = useSession();
  const feedbackMessages = messages as FeedbackMessage[];
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <main className="grow px-4 py-10 sm:px-6 md:px-10 lg:px-16">
        <section className="mx-auto grid w-full max-w-6xl items-start gap-6 rounded-3xl border border-slate-300/60 bg-white/80 p-6 shadow-lg shadow-sky-100/50 backdrop-blur-sm md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:p-10">
          <div className="animate-fade-up space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Anonymous feedback, thoughtfully delivered
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Better feedback starts with a safer conversation.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
              TrueFeedback helps people share honest thoughts without pressure.
              Create a personal link, receive anonymous messages, and improve
              with clarity.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isAuthenticated ? (
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                >
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2"
                  >
                    View My Messages
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
            <div className="grid max-w-xl grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <Card className="border-slate-200/70 bg-slate-50/80 shadow-none">
                <CardContent className="p-4">
                  <p className="text-xl font-semibold text-slate-900">100%</p>
                  <p className="text-xs text-slate-600">Anonymous by default</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200/70 bg-slate-50/80 shadow-none">
                <CardContent className="p-4">
                  <p className="text-xl font-semibold text-slate-900">
                    Private
                  </p>
                  <p className="text-xs text-slate-600">
                    Messages live in your dashboard
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200/70 bg-slate-50/80 shadow-none">
                <CardContent className="p-4">
                  <p className="text-xl font-semibold text-slate-900">
                    Actionable
                  </p>
                  <p className="text-xs text-slate-600">
                    Guided prompts improve signal
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-linear-to-br from-sky-50 to-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              How it works
            </p>
            <Card className="border-sky-100 bg-white/85 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Step 1
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Create your profile and share your personal feedback URL.
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-100 bg-white/85 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Step 2
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Others send anonymous notes using a guided, thoughtful form.
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/85 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Step 3
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Review insights privately and turn feedback into action.
                </p>
              </CardContent>
            </Card>
            <p className="pt-1 text-xs text-slate-600">
              Tip: better prompts encourage specific, useful responses.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-6xl animate-fade-up">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Recent anonymous notes
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              A preview of what thoughtful feedback looks like
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feedbackMessages.map((message, index) => (
              <Card
                key={index}
                className="h-full border-slate-200/80 bg-white/90 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900">
                    {message.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
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
            ))}
          </div>
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
