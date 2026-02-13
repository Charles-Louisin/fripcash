"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiArrowLeft } from "react-icons/fi";
import { mockConversations, type Conversation, type ConversationMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvo) return;

    const msg: ConversationMessage = {
      id: Date.now(),
      sender: "me",
      text: newMessage.trim(),
      time: "À l'instant",
    };

    const updated = conversations.map((c) =>
      c.id === activeConvo.id
        ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastMessageTime: "À l'instant" }
        : c
    );
    setConversations(updated);
    setActiveConvo(updated.find((c) => c.id === activeConvo.id) || null);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex-1 flex rounded-xl border border-border bg-card overflow-hidden min-h-0">
        {/* Conversation List */}
        <div className={cn(
          "w-full md:w-[320px] border-r border-border flex flex-col overflow-hidden",
          activeConvo ? "hidden md:flex" : "flex"
        )}>
          <div className="overflow-y-auto flex-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                type="button"
                onClick={() => setActiveConvo(convo)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors border-b border-border",
                  activeConvo?.id === convo.id && "bg-accent/50"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={convo.participantAvatar} alt={convo.participant} className="w-full h-full object-cover" />
                  </div>
                  {convo.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                      {convo.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm truncate", convo.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground")}>{convo.participant}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0 ml-2">{convo.lastMessageTime}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.articleTitle}</p>
                  <p className={cn("text-xs truncate mt-0.5", convo.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{convo.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !activeConvo ? "hidden md:flex" : "flex"
        )}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveConvo(null)}
                  className="md:hidden p-1 rounded hover:bg-accent transition-colors"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeConvo.participantAvatar} alt={activeConvo.participant} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{activeConvo.participant}</p>
                  <p className="text-xs text-muted-foreground truncate">{activeConvo.articleTitle}</p>
                </div>
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeConvo.articleImage} alt={activeConvo.articleTitle} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConvo.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      msg.sender === "me"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}>
                      <p>{msg.text}</p>
                      <p className={cn("text-[10px] mt-1", msg.sender === "me" ? "text-white/60" : "text-muted-foreground")}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message..."
                    className="flex-1 h-10 px-4 rounded-full border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <FiSend className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Sélectionnez une conversation</p>
                <p className="text-xs text-muted-foreground mt-1">Choisissez un contact pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
