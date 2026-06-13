"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { aiService } from "@/services/ai.service";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [isOpen, setIsOpen]         = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiService.chat(newMessages);
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.reply },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez !" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 flex flex-col bg-card border-border shadow-2xl transition-all duration-300 z-50 ${
        isMinimized ? "h-16 w-80" : "h-[500px] w-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Assistant FindTounsi 🇹🇳</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
                <MessageCircle className="h-12 w-12 text-primary" />
                <p className="text-sm">
                  Bonjour ! Je suis votre assistant FindTounsi. Comment puis-je vous aider à trouver des produits tunisiens ? 🌿
                </p>
                <div className="flex flex-col gap-2 w-full mt-2">
                  {[
                    "Quels sont les meilleurs produits tunisiens ?",
                    "Alternative tunisienne au Coca-Cola ?",
                    "Produits de Sfax ?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="text-xs text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}