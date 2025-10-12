'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  projectId: number;
  senderId: string;
  content: string;
  createdAt: number;
  senderName?: string;
}

interface MessagingCenterProps {
  projectId: number;
  clientName?: string;
}

export default function MessagingCenter({ projectId, clientName }: MessagingCenterProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add new message to list
      setMessages((prev) => [data.message, ...prev]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp: number) => {
    // Convert seconds to milliseconds if needed
    const ms = timestamp > 10000000000 ? timestamp : timestamp * 1000;
    const date = new Date(ms);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === session?.user?.id || senderId === session?.user?.email;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-sm text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Communication</h2>
            <p className="text-sm text-gray-600">
              Chat with {clientName || 'your client'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {[...messages].reverse().map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage(message.senderId) ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage(message.senderId)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isOwnMessage(message.senderId) && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.senderName || clientName || 'Client'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage(message.senderId)
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
