import { Search, Send, MoreVertical, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

export function Messages() {
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(1);

  const chats = [
    { id: 1, name: 'Sarah Chen', avatar: 'SC', lastMessage: 'Thanks for the study tips!', time: '2m ago', unread: 2 },
    { id: 2, name: 'Mike Johnson', avatar: 'MJ', lastMessage: 'Can we form a study group?', time: '1h ago', unread: 0 },
    { id: 3, name: 'Emma Wilson', avatar: 'EW', lastMessage: 'See you at the quiz session', time: '3h ago', unread: 0 },
    { id: 4, name: 'David Lee', avatar: 'DL', lastMessage: 'Good luck on your exam!', time: '1d ago', unread: 0 },
  ];

  const messages = [
    { id: 1, sender: 'Sarah Chen', content: 'Hey! How did your quiz go?', time: '10:30 AM', sent: false },
    { id: 2, sender: 'You', content: 'It went great! Got 92% on the React quiz 🎉', time: '10:32 AM', sent: true },
    { id: 3, sender: 'Sarah Chen', content: 'Wow, that\'s amazing! Any tips?', time: '10:33 AM', sent: false },
    { id: 4, sender: 'You', content: 'Just focus on the hooks section, that\'s where most questions come from', time: '10:35 AM', sent: true },
    { id: 5, sender: 'Sarah Chen', content: 'Thanks for the study tips!', time: '10:36 AM', sent: false },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-0 lg:gap-6 -m-4 lg:m-0">
      {/* Chat List - Full Screen on Mobile, Side Panel on Desktop */}
      <div className={`${selectedChat && 'hidden lg:flex'} lg:w-80 bg-white lg:rounded-2xl border-r lg:border border-gray-100 flex flex-col`}>
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                selectedChat === chat.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 truncate">{chat.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window - Full Screen on Mobile */}
      <div className={`${!selectedChat && 'hidden lg:flex'} flex-1 bg-white lg:rounded-2xl border lg:border-gray-100 flex flex-col`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChat(0)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors -ml-2"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
              SC
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sarah Chen</h3>
              <p className="text-xs text-gray-600">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]`}>
                {!msg.sent && (
                  <span className="text-xs text-gray-600 mb-1 block">{msg.sender}</span>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.sent
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm lg:text-base break-words">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
              <Paperclip size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors resize-none text-sm lg:text-base"
              />
            </div>
            <Button className="flex-shrink-0 h-12 px-4">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
