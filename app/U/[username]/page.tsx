"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiResponse } from "@/app/types/ApiResponse";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@/app/schemas/messageSchema";
import { z } from "zod";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

type MessageFormData = z.infer<typeof messageSchema>;

type SuggestionsResponse = ApiResponse & {
  suggestions?: string[];
};

function getLocalFallbackSuggestions(topicSeed: string): string[] {
  const topic = topicSeed.trim() || "your work";

  return [
    `What is one thing I am doing well in ${topic}, and why?`,
    `What is one improvement you would suggest for my ${topic} approach?`,
    `Can you share a specific example that supports your feedback about ${topic}?`,
    `What small change in ${topic} could create the biggest positive impact for me?`,
    `If you were coaching me on ${topic}, what would be your first recommendation?`,
  ];
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const [isFieldFocused, setIsFieldFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const lastSuggestionTopicRef = useRef("");

  const username = useMemo(
    () => decodeURIComponent(String(params?.username || "")),
    [params?.username],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful, isValid },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const content = watch("content") || "";
  const characterCount = content.length;

  const fetchSuggestions = useCallback(async (topicSeed: string) => {
    const topic =
      topicSeed.trim().slice(0, 100) || "kind and constructive feedback";

    if (lastSuggestionTopicRef.current === topic) {
      return;
    }

    lastSuggestionTopicRef.current = topic;
    setIsLoadingSuggestions(true);
    setSuggestionsError("");

    try {
      const response = await axios.post<SuggestionsResponse>(
        "/api/suggest-messages",
        {
          topic,
          tone: "friendly",
          count: 5,
        },
      );

      const nextSuggestions =
        (response.data.suggestions || []).slice(0, 5) || [];
      setSuggestions(nextSuggestions);
    } catch {
      setSuggestions(getLocalFallbackSuggestions(topic));
      setSuggestionsError("");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (!isFieldFocused || !username) return;

    const canFetch = content.trim().length === 0 || content.trim().length >= 2;
    if (!canFetch) return;

    const timeout = window.setTimeout(
      () => {
        fetchSuggestions(content);
      },
      content.trim().length > 0 ? 450 : 220,
    );

    return () => window.clearTimeout(timeout);
  }, [content, fetchSuggestions, isFieldFocused, username]);

  const onSubmit = async (data: MessageFormData) => {
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content: data.content.trim(),
      });

      toast.success(response.data.message || "Message sent successfully");
      reset({ content: "" });
      lastSuggestionTopicRef.current = "";
      setIsSuggestionsOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to send message",
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-300/70 bg-white/85 shadow-lg shadow-sky-100/60 animate-fade-up">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Anonymous mode enabled
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Send anonymous feedback
            </CardTitle>
            <p className="text-sm text-slate-700">
              You are writing to{" "}
              <span className="font-semibold">@{username}</span>. Keep it
              respectful, specific, and useful.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="content"
                  className="text-sm font-medium text-slate-800"
                >
                  Your message
                </label>
                <textarea
                  id="content"
                  {...register("content")}
                  onFocus={() => setIsFieldFocused(true)}
                  onBlur={() => setIsFieldFocused(false)}
                  placeholder="Share one thoughtful thing, one observation, or one suggestion..."
                  className="min-h-44 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-xs transition-all duration-200 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      errors.content ? "text-rose-600" : "text-slate-500"
                    }`}
                  >
                    {errors.content?.message ||
                      "At least 10 characters. Max 300 characters."}
                  </p>
                  <p className="text-xs text-slate-500">{characterCount}/300</p>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-sky-600 to-emerald-600 transition-all duration-300"
                    style={{
                      width: `${Math.min((characterCount / 300) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {isSubmitSuccessful && !errors.content && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Message delivered successfully. Thanks for sharing thoughtful
                  feedback.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !username || !isValid}
                className="h-10 w-full bg-sky-700 text-white transition-all duration-200 hover:bg-sky-800 disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending message...
                  </span>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-300/70 bg-white/85 animate-fade-up lg:sticky lg:top-24">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Writing help
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-slate-600"
                onClick={() => setIsSuggestionsOpen((prev) => !prev)}
              >
                {isSuggestionsOpen ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-slate-600">
              Suggestions appear only while you are actively composing.
            </p>
          </CardHeader>
          <CardContent>
            {!isFieldFocused &&
            content.trim().length === 0 &&
            suggestions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600">
                Focus the message field to unlock AI-powered prompts.
              </p>
            ) : (
              <div className="space-y-2">
                {isLoadingSuggestions && (
                  <p className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating suggestions...
                  </p>
                )}

                {suggestionsError && (
                  <p className="text-xs text-rose-600">{suggestionsError}</p>
                )}

                {isSuggestionsOpen &&
                  suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion}-${index}`}
                      type="button"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        setValue("content", suggestion, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        <Wand2 className="h-3.5 w-3.5 text-sky-700" />
                        {suggestion}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
