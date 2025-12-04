import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  request_id: string | null;
  offer_id: string | null;
  requester_id: string;
  requester_name: string;
  helper_id: string;
  helper_name: string;
  contact_shared: boolean;
  created_at: string;
}

export default function NeighborhoodHelpChat() {
  const [, navigate] = useLocation();
  const { tenant } = useTenant();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const conversationId = searchParams.get('id');
  const currentUserId = searchParams.get('userId') || 'current-user';

  useEffect(() => {
    if (conversationId && tenant) {
      fetchConversation();
      fetchMessages();
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId, tenant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    if (!tenant || !conversationId) return;
    
    try {
      const response = await fetch(
        `/api/neighborhood-chat/conversations/${conversationId}?tenant=${tenant.slug}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    if (!tenant || !conversationId) return;
    
    try {
      const response = await fetch(
        `/api/neighborhood-chat/conversations/${conversationId}/messages?tenant=${tenant.slug}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!tenant || !conversationId || !newMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch(
        `/api/neighborhood-chat/conversations/${conversationId}/messages?tenant=${tenant.slug}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            senderName: conversation?.requester_id === currentUserId 
              ? conversation.requester_name 
              : conversation?.helper_name,
            message: newMessage
          })
        }
      );
      
      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Fehler beim Senden der Nachricht');
    } finally {
      setSending(false);
    }
  };

  const shareContact = async () => {
    if (!tenant || !conversationId) return;
    
    const confirmed = window.confirm(
      'Möchten Sie Ihre Kontaktdaten mit diesem Nutzer teilen? Dies kann nicht rückgängig gemacht werden.'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(
        `/api/neighborhood-chat/conversations/${conversationId}/share-contact?tenant=${tenant.slug}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId })
        }
      );
      
      if (response.ok) {
        fetchConversation();
        alert('Kontaktdaten wurden geteilt!');
      }
    } catch (error) {
      console.error('Error sharing contact:', error);
      alert('Fehler beim Teilen der Kontaktdaten');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Lade Konversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Konversation nicht gefunden</p>
          <Button onClick={() => navigate("/neighborhood-help")}>
            Zurück zur Nachbarschaftshilfe
          </Button>
        </div>
      </div>
    );
  }

  const otherUserName = conversation.requester_id === currentUserId 
    ? conversation.helper_name 
    : conversation.requester_name;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 shadow-md">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/neighborhood-help")}
              className="text-white hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <div>
              <h1 className="text-xl font-bold">Chat mit {otherUserName}</h1>
              <p className="text-sm text-green-100">
                {conversation.contact_shared 
                  ? "Kontaktdaten geteilt" 
                  : "Anonymer Chat"}
              </p>
            </div>
          </div>
          
          {!conversation.contact_shared && (
            <Button
              onClick={shareContact}
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Kontakt teilen
            </Button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Noch keine Nachrichten.</p>
              <p className="text-sm mt-2">Schreiben Sie die erste Nachricht!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      isOwnMessage
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {isOwnMessage ? 'Sie' : message.sender_name}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isOwnMessage ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="container mx-auto max-w-4xl flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht schreiben..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
