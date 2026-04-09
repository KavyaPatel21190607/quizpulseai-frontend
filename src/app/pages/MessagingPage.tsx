import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck,
  Smile,
  MoreVertical,
  ArrowLeft,
  Download,
  MessageSquare,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../services/api';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  file?: {
    name: string;
    type: string;
    url: string;
    size: number;
  };
}

interface Chat {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    lastSeen?: Date;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  messages: Message[];
  blockedByMe?: boolean;
  blockedMe?: boolean;
}

interface SearchStudent {
  id: string;
  name: string;
  avatar: string;
  email?: string;
}

export default function MessagingPage() {
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStudents, setSearchStudents] = useState<SearchStudent[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ blockedByMe: false, blockedMe: false });
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoadingChats(true);
        const response = await apiClient.getConversations();
        const conversations = response?.data?.conversations || [];

        const mappedChats: Chat[] = conversations.map((conv: any) => {
          const otherUser = (conv.participants || []).find((p: any) => p._id !== currentUser?.id && p.id !== currentUser?.id) || conv.participants?.[0];
          return {
            id: String(conv._id || conv.id),
            user: {
              id: String(otherUser?._id || otherUser?.id || ''),
              name: otherUser?.name || 'Unknown User',
              avatar: otherUser?.avatar || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff',
              status: 'offline',
            },
            lastMessage: conv?.lastMessage?.content ? 'Encrypted message' : 'No messages yet',
            lastMessageTime: new Date(conv?.lastMessageTime || conv?.updatedAt || Date.now()),
            unread: 0,
            messages: [],
            blockedByMe: Boolean(conv?.blockedByMe),
            blockedMe: Boolean(conv?.blockedMe),
          };
        });

        setChats(mappedChats);
      } catch (error: any) {
        setMessageError(error?.message || 'Failed to load conversations');
      } finally {
        setLoadingChats(false);
      }
    };

    if (currentUser?.id) {
      loadConversations();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (!selectedChat?.user?.id) {
        setBlockStatus({ blockedByMe: false, blockedMe: false });
        return;
      }

      try {
        const response = await apiClient.getBlockStatus(selectedChat.user.id);
        setBlockStatus({
          blockedByMe: Boolean(response?.data?.blockedByMe),
          blockedMe: Boolean(response?.data?.blockedMe),
        });
      } catch {
        setBlockStatus({
          blockedByMe: Boolean(selectedChat.blockedByMe),
          blockedMe: Boolean(selectedChat.blockedMe),
        });
      }
    };

    fetchBlockStatus();
  }, [selectedChat?.id, selectedChat?.user?.id, selectedChat?.blockedByMe, selectedChat?.blockedMe]);

  useEffect(() => {
    const findStudents = async () => {
      const query = searchQuery.trim();
      if (query.length < 1) {
        setSearchStudents([]);
        setSearchingStudents(false);
        return;
      }

      try {
        setSearchingStudents(true);
        const response = await apiClient.searchUsers(query);
        const users = response?.data?.users || [];

        const mapped: SearchStudent[] = users.map((u: any) => ({
          id: String(u._id || u.id),
          name: u.name || 'Unknown User',
          avatar: u.avatar || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff',
          email: u.email || '',
        }));

        setSearchStudents(mapped);
      } catch {
        setSearchStudents([]);
      } finally {
        setSearchingStudents(false);
      }
    };

    const timeoutId = window.setTimeout(findStudents, 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadMessages = async (conversationId: string) => {
    try {
      setMessageError('');
      const response = await apiClient.getMessages(conversationId);
      const backendMessages = response?.data?.messages || [];

      const mappedMessages: Message[] = backendMessages.map((msg: any) => ({
        id: String(msg._id || msg.id),
        senderId: String(msg?.senderId?._id || msg?.senderId || ''),
        text: msg.content || '',
        timestamp: new Date(msg.createdAt || Date.now()),
        read: Boolean(msg.isRead),
        file: msg.attachments?.[0]
          ? {
              name: msg.attachments[0].filename,
              type: msg.attachments[0].type,
              url: msg.attachments[0].url,
              size: msg.attachments[0].size,
            }
          : undefined,
      }));

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId ? { ...chat, messages: mappedMessages } : chat
        )
      );

      setSelectedChat((prev) =>
        prev && prev.id === conversationId ? { ...prev, messages: mappedMessages } : prev
      );
    } catch (error: any) {
      setMessageError(error?.message || 'Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openConversationWithUser = async (targetUser: SearchStudent) => {
    try {
      setMessageError('');
      const response = await apiClient.getOrCreateConversation(targetUser.id);
      const conversation = response?.data?.conversation;
      if (!conversation) {
        return;
      }

      const chatId = String(conversation._id || conversation.id);
      const existing = chats.find((c) => c.id === chatId);

      const chatToSelect: Chat = existing || {
        id: chatId,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
          status: 'offline',
        },
        lastMessage: 'No messages yet',
        lastMessageTime: new Date(conversation.updatedAt || Date.now()),
        unread: 0,
        messages: [],
      };

      if (!existing) {
        setChats((prev) => [chatToSelect, ...prev]);
      }

      setSelectedChat(chatToSelect);
      await loadMessages(chatId);
    } catch (error: any) {
      setMessageError(error?.message || 'Failed to start conversation');
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedChat?.user?.id) {
      return;
    }

    try {
      setMessageError('');

      if (blockStatus.blockedByMe) {
        await apiClient.unblockUser(selectedChat.user.id);
        setBlockStatus((prev) => ({ ...prev, blockedByMe: false }));
        setChats((prev) =>
          prev.map((chat) => (chat.id === selectedChat.id ? { ...chat, blockedByMe: false } : chat))
        );
        setSelectedChat((prev) => (prev ? { ...prev, blockedByMe: false } : prev));
      } else {
        await apiClient.blockUser(selectedChat.user.id);
        setBlockStatus((prev) => ({ ...prev, blockedByMe: true }));
        setChats((prev) =>
          prev.map((chat) => (chat.id === selectedChat.id ? { ...chat, blockedByMe: true } : chat))
        );
        setSelectedChat((prev) => (prev ? { ...prev, blockedByMe: true } : prev));
      }
    } catch (error: any) {
      setMessageError(error?.message || 'Failed to update block settings');
    } finally {
      setIsActionMenuOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || (!messageText.trim() && selectedFiles.length === 0)) return;

    if (blockStatus.blockedByMe || blockStatus.blockedMe) {
      setMessageError(
        blockStatus.blockedByMe
          ? 'You have blocked this student. Unblock to send messages.'
          : 'You cannot send messages because this student has blocked you.'
      );
      return;
    }

    try {
      setMessageError('');
      await apiClient.sendMessage(
        selectedChat.id,
        selectedChat.user.id,
        messageText,
        selectedFiles
      );

      setMessageText('');
      setSelectedFiles([]);
      await loadMessages(selectedChat.id);
    } catch (error: any) {
      setMessageError(error?.message || 'Failed to send message');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const formatTime = (date?: Date | null) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
      return 'Recently';
    }

    const now = new Date();
    const safeDate = new Date(date);
    const diff = now.getTime() - safeDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return safeDate.toLocaleDateString();
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownloadAttachment = async (file?: Message['file']) => {
    if (!file?.url) {
      return;
    }

    try {
      const response = await fetch(file.url, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = file.name || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  const showChatList = !isMobileView || !selectedChat;
  const showChatWindow = !isMobileView || selectedChat;
  const shouldShowSidebar = showChatList && !isSidebarHidden;

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex bg-background">
      {/* Chat List */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={isMobileView ? { x: 0 } : false}
            exit={isMobileView ? { x: -300 } : { x: -384, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-80 lg:w-96 border-r border-border bg-background flex flex-col"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-border bg-accent/30">
              <h2 className="text-xl font-semibold mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <p className="text-muted-foreground">Loading conversations...</p>
                </div>
              ) : filteredChats.length === 0 && searchStudents.length === 0 && !searchingStudents ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Search className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                <>
                  {searchQuery.trim().length >= 1 && (
                    <div className="border-b border-border bg-accent/20">
                      <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Student Search
                      </p>
                      {searchingStudents ? (
                        <p className="px-4 pb-3 text-sm text-muted-foreground">Searching students...</p>
                      ) : searchStudents.length === 0 ? (
                        <p className="px-4 pb-3 text-sm text-muted-foreground">No matching students.</p>
                      ) : (
                        searchStudents.map((student) => (
                          <button
                            key={`student-${student.id}`}
                            onClick={async () => openConversationWithUser(student)}
                            className="w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-t border-border text-left"
                          >
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{student.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{student.email || 'Student'}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={async () => {
                        setSelectedChat(chat);
                        await loadMessages(chat.id);
                      }}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border ${
                        selectedChat?.id === chat.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={chat.user.avatar}
                          alt={chat.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        {chat.user.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{chat.user.name}</h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                          {chat.unread > 0 && (
                            <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center flex-shrink-0">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      {showChatWindow && (
        <div className="flex-1 flex flex-col bg-background">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-accent/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors -ml-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  {!isMobileView && (
                    <button
                      onClick={() => setIsSidebarHidden(!isSidebarHidden)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors -ml-2"
                      title={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
                    >
                      {isSidebarHidden ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                  )}
                  <div className="relative">
                    <img
                      src={selectedChat.user.avatar}
                      alt={selectedChat.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {selectedChat.user.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedChat.user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.user.status === 'online'
                        ? 'Online'
                        : selectedChat.user.lastSeen
                        ? `Last seen ${formatTime(selectedChat.user.lastSeen)}`
                        : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setIsActionMenuOpen((prev) => !prev)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isActionMenuOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-background border border-border rounded-lg shadow-md z-20">
                        <button
                          onClick={handleToggleBlock}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-lg"
                        >
                          {blockStatus.blockedByMe ? 'Unblock Student' : 'Block Student'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-accent/10 to-background">
                {messageError && (
                  <div className="max-w-4xl mx-auto mb-4 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                    {messageError}
                  </div>
                )}
                <div className="max-w-4xl mx-auto space-y-4">
                  {selectedChat.messages.map((message) => {
                    const isSent = message.senderId === currentUser?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] sm:max-w-md rounded-2xl px-4 py-2 ${
                            isSent
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-accent text-foreground rounded-bl-sm'
                          }`}
                        >
                          {message.file && (
                            <div className="mb-2">
                              {message.file.type.startsWith('image/') ? (
                                <img
                                  src={message.file.url}
                                  alt={message.file.name}
                                  className="rounded-lg max-w-full mb-2"
                                />
                              ) : (
                                <div className="flex items-center gap-3 p-3 bg-background/10 rounded-lg mb-2">
                                  {getFileIcon(message.file.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {message.file.name}
                                    </p>
                                    <p className="text-xs opacity-70">
                                      {formatFileSize(message.file.size)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadAttachment(message.file)}
                                    className="p-2 hover:bg-background/20 rounded-lg"
                                    aria-label={`Download ${message.file.name}`}
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {message.text && <p className="text-sm break-words">{message.text}</p>}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {isSent && (
                              message.read ? (
                                <CheckCheck className="w-4 h-4 opacity-70" />
                              ) : (
                                <Check className="w-4 h-4 opacity-70" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-background">
                {(blockStatus.blockedByMe || blockStatus.blockedMe) && (
                  <div className="mb-3 p-3 rounded-lg border border-amber-300 text-amber-800 bg-amber-50">
                    {blockStatus.blockedByMe
                      ? 'You blocked this student. Unblock from the 3-dot menu to continue chatting.'
                      : 'This student has blocked you. You cannot send new messages.'}
                  </div>
                )}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg text-sm"
                      >
                        {getFileIcon(file.type)}
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          className="p-1 hover:bg-background rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={blockStatus.blockedByMe || blockStatus.blockedMe}
                    className="p-3 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={blockStatus.blockedByMe || blockStatus.blockedMe}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 pr-12 bg-accent border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none max-h-32"
                      rows={1}
                    />
                    <button className="absolute right-3 bottom-3 p-1 hover:bg-background rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={
                      blockStatus.blockedByMe ||
                      blockStatus.blockedMe ||
                      (!messageText.trim() && selectedFiles.length === 0)
                    }
                    className="p-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
