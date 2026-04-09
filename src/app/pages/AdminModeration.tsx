import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Search, AlertTriangle, MessageSquare, Eye, ChevronDown } from 'lucide-react';
import { apiClient } from '../../services/api';

interface ConversationRow {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  flagged: boolean;
}

interface MessageRow {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  flagged: boolean;
}

const FLAG_WORDS = ['spam', 'scam', 'abuse', 'hate', 'cheat'];

const isFlaggedText = (value: string) => {
  const text = value.toLowerCase();
  return FLAG_WORDS.some((w) => text.includes(w));
};

export default function AdminModeration() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flagged'>('all');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.getAdminModerationConversations();
        const rows = (response?.data?.conversations || []).map((c: any) => {
          const participantNames = (c.participants || []).map((p: any) => p.name || 'Unknown');
          const lastMessage = c?.lastMessage?.content || 'No messages yet';
          return {
            id: String(c._id || c.id),
            participants: participantNames,
            lastMessage,
            timestamp: c?.updatedAt ? new Date(c.updatedAt).toLocaleString() : '-',
            flagged: isFlaggedText(lastMessage),
          };
        });

        setConversations(rows);
      } catch (err: any) {
        setError(err?.message || 'Failed to load moderation data');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const loadMessages = async (conversationId: string) => {
    try {
      setError('');
      const response = await apiClient.getAdminModerationMessages(conversationId);
      const rows = (response?.data?.messages || []).map((m: any) => ({
        id: String(m._id || m.id),
        sender: m?.senderId?.name || 'Unknown',
        content: m.content || '',
        timestamp: m?.createdAt ? new Date(m.createdAt).toLocaleString() : '-',
        flagged: isFlaggedText(m.content || ''),
      }));
      setMessages(rows);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages');
    }
  };

  const filteredChats = useMemo(() => {
    return conversations.filter((chat) => {
      const participantText = chat.participants.join(' ↔ ').toLowerCase();
      const matchesSearch =
        participantText.includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || chat.flagged;
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, filterType]);

  const flaggedCount = conversations.filter((c) => c.flagged).length;

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Message Moderation</h1>
        <p className="text-muted-foreground">Monitor real conversations from backend</p>
      </motion.div>

      {error && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Chats</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">{loading ? '...' : conversations.length}</div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Flagged Conversations</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{loading ? '...' : flaggedCount}</div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Messages Loaded</span>
            <Eye className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold">{messages.length}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-background border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'flagged')}
                  className="pl-4 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="all">All Chats</option>
                  <option value="flagged">Flagged Only</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl overflow-hidden">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={async () => {
                  setSelectedChat(chat.id);
                  await loadMessages(chat.id);
                }}
                className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/30 ${
                  selectedChat === chat.id ? 'bg-accent/50' : ''
                } ${chat.flagged ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {chat.flagged && <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium truncate">{chat.participants.join(' ↔ ')}</div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.timestamp}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{chat.lastMessage}</div>
                  </div>
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground">No conversations found</div>
            )}
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {selectedChat ? (
            <div className="flex flex-col h-[600px]">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">Chat Preview</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.flagged
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800'
                        : 'bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium flex items-center gap-2">
                        {message.sender}
                        {message.flagged && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <p className="text-muted-foreground text-sm">No messages in this conversation</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
              <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">Select a chat to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
