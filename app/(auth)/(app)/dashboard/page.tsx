"use client";

import { MessageCard } from "@/components/ui/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ApiResponse } from "@/app/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { acceptMessageSchema } from "@/app/schemas/acceptMessageSchema";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type DashboardMessage = {
  _id: string;
  content: string;
  createdAt: Date | string;
};

function UserDashboard() {
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to fetch message settings",
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        const normalizedMessages: DashboardMessage[] = (
          response.data.messages || []
        ).map((message) => ({
          _id: String(message._id),
          content: message.content,
          createdAt: message.createdAt,
        }));
        setMessages(normalizedMessages);
        if (refresh) {
          toast.success("Showing latest messages");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message ?? "Failed to fetch messages",
        );
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast],
  );

  // Fetch initial state from the server
  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ??
          "Failed to update message settings",
      );
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const username = (session.user as { username?: string }).username ?? "";

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/U/${encodeURIComponent(username)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL has been copied to clipboard.");
  };

  return (
    <div className="mx-auto my-6 w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8 animate-fade-up">
      <div className="rounded-2xl border border-slate-300/70 bg-white/90 p-5 shadow-lg shadow-sky-100/60 sm:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your inbox and sharing preferences in one place.
            </p>
          </div>
          <Button
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </span>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Your unique link
            </h2>
            <p className="mb-3 text-xs text-slate-600">
              Share this URL to collect anonymous feedback.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={profileUrl} readOnly className="h-10 bg-white" />
              <Button
                onClick={copyToClipboard}
                className="h-10 bg-sky-700 text-white hover:bg-sky-800"
              >
                Copy Link
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Inbox status
            </h2>
            <div className="flex items-center gap-3">
              <Switch
                {...register("acceptMessages")}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
                className={isSwitchLoading ? "animate-pulse-border" : ""}
              />
              <span className="text-sm text-slate-700">
                Accept messages: {acceptMessages ? "On" : "Off"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Turn this off when you need a quiet inbox.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-700">No messages yet.</p>
              <p className="mt-1 text-xs text-slate-500">
                Share your link to start receiving feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
