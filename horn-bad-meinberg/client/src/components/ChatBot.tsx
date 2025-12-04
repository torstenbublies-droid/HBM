import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Bot } from "lucide-react";
import { nanoid } from "nanoid";

interface ChatBotProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Helper function to convert Markdown links to HTML
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex to match Markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        {linkText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

export default function ChatBot({ onClose }: ChatBotProps) {
  const { tenant } = useTenant();
  const [sessionId] = useState(() => nanoid());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hallo! Ich bin ${tenant?.chatbotName || 'Ihr digitaler Assistent'} für ${tenant?.name || 'Ihre Stadt'}. Ich kann Ihnen Informationen über die Stadt, Veranstaltungen, Öffnungszeiten und vieles mehr geben. Wie kann ich Ihnen helfen?`,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut." },
      ]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    // Get conversation history (last 10 messages)
    const conversationHistory = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    chatMutation.mutate({
      message: userMessage,
      sessionId,
      conversationHistory,
    });
  };

  // Quick chips removed - users should ask freely

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <Card className="w-full md:max-w-2xl h-[90vh] md:h-[700px] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div 
          className="text-white p-4 flex items-center justify-between"
          style={{ 
            background: `linear-gradient(to right, ${tenant?.primaryColor || '#0066CC'}, ${tenant?.primaryColor || '#0066CC'}dd)` 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{tenant?.chatbotName || 'Chatbot'}</h2>
              <p className="text-xs text-primary-foreground/80">Ihr digitaler Assistent</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot size={16} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white border border-border shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{parseMarkdownLinks(message.content)}</p>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="bg-white border border-border rounded-2xl px-4 py-3 shadow-sm">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips removed for cleaner UX */}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stellen Sie Ihre Frage..."
              className="flex-1"
              disabled={chatMutation.isPending}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || chatMutation.isPending}
              className="shadow-md"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by GPT - Echtzeit-Antworten
          </p>
        </form>
      </Card>
    </div>
  );
}

