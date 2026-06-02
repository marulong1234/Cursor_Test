"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import type { SessionUpdatePayload } from "@/lib/types";

export const SESSIONS_KEY = ["sessions"] as const;
export const sessionKey = (id: string) => ["session", id] as const;

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => api.listSessions(),
  });
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionKey(sessionId ?? ""),
    queryFn: () => api.getSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.createSession(),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      router.push(`/chat/${session.id}`);
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionUpdatePayload }) =>
      api.updateSession(id, data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: sessionKey(session.id) });
    },
  });
}

export function useDeleteSession(currentSessionId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSession(sessionId),
    onSuccess: async (_, deletedId) => {
      queryClient.removeQueries({ queryKey: sessionKey(deletedId) });
      const sessions = await queryClient.fetchQuery({
        queryKey: SESSIONS_KEY,
        queryFn: () => api.listSessions(),
      });
      const remaining = sessions.items.filter((s) => s.id !== deletedId);

      if (currentSessionId === deletedId) {
        if (remaining.length > 0) {
          router.push(`/chat/${remaining[0].id}`);
        } else {
          router.push("/");
        }
      }
    },
  });
}
