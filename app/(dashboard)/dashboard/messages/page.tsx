"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiArrowLeft } from "react-icons/fi";
import { useConversations, useMessages, useSendMessage } from "@/hooks/use-messages";
import { useMe } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { data: user } = useMe();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendMessage();

  const { data: messages = [] } = useMessages(activeConvoId || "");

  const activeConvo = conversations.find((c: any) => c._id === activeConvoId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const userId = user?.id || user?._id || "";

  // Derive participant info from conversation
  const getParticipant = (convo: any) => {
    if (!convo) return { name: "", avatar: "" };
    // The backend returns participants array or otherParticipant
    if (convo.otherParticipant) {
      return { name: convo.otherParticipant.pseudo || "Utilisateur", avatar: convo.otherParticipant.avatar || "" };
    }
    // Fallback: find the participant who isn't the current user
    const other = (convo.participants || []).find((p: any) => {
      const pId = typeof p === "object" ? (p._id || p.id) : p;
      return pId !== userId;
    });
    if (typeof other === "object") {
      return { name: other.pseudo || "Utilisateur", avatar: other.avatar || "" };
    }
    return { name: "Utilisateur", avatar: "" };
  };

  const getArticleInfo = (convo: any) => {
    if (!convo?.article) return { title: "", image: "" };
    if (typeof convo.article === "object") {
      return { title: convo.article.title || "", image: convo.article.images?.[0] || "" };
    }
    return { title: "", image: "" };
  };

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvoId) return;
    sendMessage.mutate(
      { conversationId: activeConvoId, text: newMessage.trim() },
      { onSuccess: () => setNewMessage("") }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
          activeConvoId ? "hidden md:flex" : "flex"
        )}>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Aucune conversation</p>
              </div>
            ) : (
              conversations.map((convo: any) => {
                const participant = getParticipant(convo);
                const articleInfo = getArticleInfo(convo);
                return (
                  <button
                    key={convo._id}
                    type="button"
                    onClick={() => setActiveConvoId(convo._id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors border-b border-border",
                      activeConvoId === convo._id && "bg-accent/50"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        {participant.avatar && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      {convo.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm truncate", convo.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground")}>{participant.name}</p>
                        <p className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}
                        </p>
                      </div>
                      {articleInfo.title && <p className="text-xs text-muted-foreground truncate mt-0.5">{articleInfo.title}</p>}
                      <p className={cn("text-xs truncate mt-0.5", convo.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{convo.lastMessage || ""}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !activeConvoId ? "hidden md:flex" : "flex"
        )}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveConvoId(null)}
                  className="md:hidden p-1 rounded hover:bg-accent transition-colors"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-muted">
                  {getParticipant(activeConvo).avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={getParticipant(activeConvo).avatar} alt={getParticipant(activeConvo).name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{getParticipant(activeConvo).name}</p>
                  {getArticleInfo(activeConvo).title && (
                    <p className="text-xs text-muted-foreground truncate">{getArticleInfo(activeConvo).title}</p>
                  )}
                </div>
                {getArticleInfo(activeConvo).image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getArticleInfo(activeConvo).image} alt={getArticleInfo(activeConvo).title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const isMine = (msg.sender?._id || msg.sender) === userId;
                  return (
                    <div key={msg._id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                        isMine
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}>
                        <p>{msg.text || msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isMine ? "text-white/60" : "text-muted-foreground")}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
                    disabled={!newMessage.trim() || sendMessage.isPending}
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
