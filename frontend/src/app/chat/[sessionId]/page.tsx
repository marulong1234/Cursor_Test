import { ChatArea } from "@/components/chat/chat-area";
import { AppShell } from "@/components/layout/app-shell";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <AppShell>
      <ChatArea sessionId={sessionId} />
    </AppShell>
  );
}
