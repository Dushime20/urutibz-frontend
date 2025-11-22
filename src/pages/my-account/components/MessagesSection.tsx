import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MessageCircle, Search, Send, Paperclip, Smile, Check, CheckCheck, Clock,
  Image as ImageIcon, FileText, Loader2, X, ExternalLink, Package, User,
  MoreVertical, Filter, Archive, Trash2, Star
} from 'lucide-react';
import { useMessaging } from '../../../hooks/useMessaging';
import { useAuth } from '../../../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
}

interface ChatWithParticipant {
  id: string;
  participant_ids: string[];
  product_id?: string;
  booking_id?: string;
  subject?: string;
  last_message_preview?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  unread_count?: number;
  otherParticipant?: ChatParticipant;
  product?: {
    id: string;
    title: string;
    image?: string;
    owner_id?: string;
  };
  userRole?: 'owner' | 'renter'; // User's role in this conversation
}

const MessagesSection: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    createOrGetChat,
    loadMessages,
    sendMessage,
    markChatAsRead,
    typingUsers,
    setTyping
  } = useMessaging();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [chatsWithParticipants, setChatsWithParticipants] = useState<ChatWithParticipant[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [chatProductContexts, setChatProductContexts] = useState<Record<string, { productId?: string; productTitle?: string }>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load chats with participant information
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const loadChatsWithParticipants = async () => {
      try {
        setLoadingChats(true);
        const token = localStorage.getItem('token');
        
        // Fetch chats
        const response = await axios.get(`${API_BASE_URL}/messaging/chats`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 50 }
        });

        const chatsData = response.data?.data?.chats || response.data?.data || response.data || [];
        
        // Fetch participant information for each chat
        const chatsWithInfo = await Promise.all(
          chatsData.map(async (chat: any) => {
            const otherParticipantId = chat.participant_ids?.find((id: string) => id !== user.id);
            
            if (!otherParticipantId) return null;

            try {
              // Fetch other participant info
              const userResponse = await axios.get(`${API_BASE_URL}/users/${otherParticipantId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const participant = userResponse.data?.data || userResponse.data;
              const participantName = participant.first_name && participant.last_name
                ? `${participant.first_name} ${participant.last_name}`
                : participant.email || 'User';

              // Fetch product info if available (for display purposes)
              let product = null;
              if (chat.product_id) {
                try {
                  const productResponse = await axios.get(`${API_BASE_URL}/products/${chat.product_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const productData = productResponse.data?.data || productResponse.data;
                  product = {
                    id: productData.id,
                    title: productData.title,
                    image: productData.images?.[0]?.image_url || productData.image
                  };
                } catch (err) {
                  console.error('Error fetching product:', err);
                }
              }

              // Use userRole from backend (already determined by the API)
              // Backend automatically determines role based on product/booking ownership
              const userRole = chat.userRole;

              return {
                ...chat,
                otherParticipant: {
                  id: otherParticipantId,
                  name: participantName,
                  avatar: participant.profile_image || participant.profileImageUrl || participant.avatar
                },
                product,
                unread_count: chat.unread_count || 0,
                userRole // Use backend-provided role
              };
            } catch (err) {
              console.error('Error fetching participant:', err);
              return {
                ...chat,
                otherParticipant: {
                  id: otherParticipantId,
                  name: 'Unknown User',
                  avatar: undefined
                },
                unread_count: chat.unread_count || 0
              };
            }
          })
        );

        setChatsWithParticipants(chatsWithInfo.filter(Boolean) as ChatWithParticipant[]);
      } catch (err: any) {
        console.error('Error loading chats:', err);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChatsWithParticipants();
  }, [isAuthenticated, user?.id]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId && isAuthenticated) {
      loadMessages(selectedChatId);
      markChatAsRead(selectedChatId);
    }
  }, [selectedChatId, isAuthenticated, loadMessages, markChatAsRead]);

  // Extract productContext from messages and store per chat
  useEffect(() => {
    if (selectedChatId && messages.length > 0) {
      const messageWithContext = messages.find(msg => msg.productContext?.productTitle || msg.productContext?.productId);
      if (messageWithContext?.productContext) {
        setChatProductContexts(prev => ({
          ...prev,
          [selectedChatId]: {
            productId: messageWithContext.productContext?.productId,
            productTitle: messageWithContext.productContext?.productTitle
          }
        }));
      }
    }
  }, [selectedChatId, messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter chats
  const filteredChats = useMemo(() => {
    let filtered = chatsWithParticipants;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.otherParticipant?.name.toLowerCase().includes(query) ||
        chat.product?.title.toLowerCase().includes(query) ||
        chat.last_message_preview?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filter === 'unread') {
      filtered = filtered.filter(chat => (chat.unread_count || 0) > 0);
    } else if (filter === 'archived') {
      // TODO: Implement archived filter when backend supports it
      filtered = [];
    }

    // Sort by last message time
    return filtered.sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [chatsWithParticipants, searchQuery, filter]);

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    if (selectedChatId && isAuthenticated) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setTyping(selectedChatId, true);

      typingTimeoutRef.current = setTimeout(() => {
        setTyping(selectedChatId, false);
      }, 3000);
    }
  }, [selectedChatId, isAuthenticated, setTyping]);

  // Send message
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!messageText.trim() || !selectedChatId || !isAuthenticated || sending) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText('');

    if (selectedChatId) {
      setTyping(selectedChatId, false);
    }

    try {
      await sendMessage(selectedChatId, textToSend, 'text');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [messageText, selectedChatId, isAuthenticated, sending, sendMessage, setTyping]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format timestamp
  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, h:mm a');
    }
  };

  const formatChatTime = (date?: string) => {
    if (!date) return '';
    const chatDate = new Date(date);
    if (isToday(chatDate)) {
      return format(chatDate, 'h:mm a');
    } else if (isYesterday(chatDate)) {
      return 'Yesterday';
    } else {
      return format(chatDate, 'MMM d');
    }
  };

  const selectedChat = chatsWithParticipants.find(c => c.id === selectedChatId);
  const totalUnread = chatsWithParticipants.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
  
  // Get product title from message productContext if available, otherwise use chat product
  const displayProductTitle = useMemo(() => {
    if (!selectedChatId || messages.length === 0) {
      return selectedChat?.product?.title;
    }
    // Find first message with productContext
    const messageWithContext = messages.find(msg => msg.productContext?.productTitle);
    if (messageWithContext?.productContext?.productTitle) {
      return messageWithContext.productContext.productTitle;
    }
    return selectedChat?.product?.title;
  }, [selectedChatId, messages, selectedChat?.product?.title]);
  
  // Get product ID from message productContext if available, otherwise use chat product
  const displayProductId = useMemo(() => {
    if (!selectedChatId || messages.length === 0) {
      return selectedChat?.product?.id;
    }
    // Find first message with productContext
    const messageWithContext = messages.find(msg => msg.productContext?.productId);
    if (messageWithContext?.productContext?.productId) {
      return messageWithContext.productContext.productId;
    }
    return selectedChat?.product?.id;
  }, [selectedChatId, messages, selectedChat?.product?.id]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-slate-400">Please log in to view your messages</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#00aaa9]" />
            Messages
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-300px)] min-h-[600px]">
          {/* Chat List Sidebar */}
          <div className="w-full lg:w-80 border-r border-gray-200 dark:border-slate-700 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00aaa9]"
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-[#00aaa9] text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors relative ${
                    filter === 'unread'
                      ? 'bg-[#00aaa9] text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Unread
                  {totalUnread > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {totalUnread}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loadingChats ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredChats.map((chat) => {
                    const isSelected = chat.id === selectedChatId;
                    const hasUnread = (chat.unread_count || 0) > 0;
                    
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                          isSelected ? 'bg-[#00aaa9]/10 border-l-4 border-[#00aaa9]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {chat.otherParticipant?.avatar ? (
                              <img
                                src={chat.otherParticipant.avatar}
                                alt={chat.otherParticipant.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {hasUnread && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            )}
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold truncate ${
                                  hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'
                                }`}>
                                  {chat.otherParticipant?.name || 'Unknown User'}
                                </h3>
                                {/* Role Badge */}
                                {chat.userRole && (
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                                    chat.userRole === 'owner'
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  }`}>
                                    {chat.userRole === 'owner' ? 'Owner' : 'Renter'}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2">
                                {formatChatTime(chat.last_message_at)}
                              </span>
                            </div>
                            
                            {(chatProductContexts[chat.id]?.productTitle || chat.product) && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 truncate mb-1 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {chatProductContexts[chat.id]?.productTitle || chat.product?.title}
                              </p>
                            )}
                            
                            <p className={`text-sm truncate ${
                              hasUnread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-slate-400'
                            }`}>
                              {chat.last_message_preview || 'No messages yet'}
                            </p>
                            
                            {hasUnread && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-[#00aaa9] text-white text-xs rounded-full">
                                {chat.unread_count} new
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Message View */}
          <div className="flex-1 flex flex-col">
            {selectedChatId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedChat?.otherParticipant?.avatar ? (
                        <img
                          src={selectedChat.otherParticipant.avatar}
                          alt={selectedChat.otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat?.otherParticipant?.name || 'Unknown User'}
                          </h3>
                          {/* Role Badge */}
                          {selectedChat?.userRole && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              selectedChat.userRole === 'owner'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}>
                              {selectedChat.userRole === 'owner' ? 'You are Owner' : 'You are Renter'}
                            </span>
                          )}
                        </div>
                        {(displayProductTitle || selectedChat?.product) && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <Package className="w-3 h-3 text-gray-500" />
                            <Link
                              to={`/it/${displayProductId || selectedChat?.product?.id}`}
                              className="text-xs text-[#00aaa9] hover:underline"
                            >
                              {displayProductTitle || selectedChat?.product?.title}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(displayProductId || selectedChat?.product) && (
                      <Link
                        to={`/it/${displayProductId || selectedChat?.product?.id}`}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-[#00aaa9] hover:bg-[#00aaa9]/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Product
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-slate-800/50 space-y-4 scrollbar-hide">
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 dark:text-red-400 py-8">
                      {error}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-slate-400 py-12">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const isRead = message.is_read && message.message_status === 'read';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                                isOwnMessage
                                  ? 'bg-[#00aaa9] text-white rounded-br-sm'
                                  : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-slate-600'
                              }`}
                            >
                              {/* Product Context Badge (for receiver identification) */}
                              {message.productContext?.productId && !isOwnMessage && (
                                <div className="mb-2 pb-2 border-b border-gray-200 dark:border-slate-600">
                                  <Link
                                    to={`/it/${message.productContext.productId}`}
                                    className="flex items-center gap-2 text-xs text-[#00aaa9] hover:underline"
                                  >
                                    <Package className="w-3 h-3" />
                                    <span className="font-medium">
                                      {message.productContext.productTitle || 'View Product'}
                                    </span>
                                  </Link>
                                </div>
                              )}
                              
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {message.content}
                              </p>
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((att, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${isOwnMessage ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-600'}`}>
                                      {att.file_type?.startsWith('image/') ? (
                                        <ImageIcon className="w-4 h-4" />
                                      ) : (
                                        <FileText className="w-4 h-4" />
                                      )}
                                      <a
                                        href={att.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline truncate flex-1"
                                      >
                                        {att.file_name}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Timestamp and status */}
                              <div className={`flex items-center justify-between gap-2 mt-2 text-xs ${
                                isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-slate-400'
                              }`}>
                                <span>{formatMessageTime(message.created_at)}</span>
                                {isOwnMessage && (
                                  <span className="flex items-center">
                                    {message.message_status === 'sending' ? (
                                      <Clock className="w-3 h-3" />
                                    ) : message.message_status === 'sent' || message.message_status === 'delivered' ? (
                                      <Check className="w-3 h-3" />
                                    ) : isRead ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3 opacity-50" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200 dark:border-slate-600 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">
                            {selectedChat?.otherParticipant?.name} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={messageText}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00aaa9] dark:bg-slate-800 dark:text-white text-sm"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                        disabled={sending}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Attach file"
                        >
                          <Paperclip className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Emoji"
                        >
                          <Smile className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="px-4 sm:px-6 py-3 bg-[#00aaa9] hover:bg-[#01aaa7] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-slate-400">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;
