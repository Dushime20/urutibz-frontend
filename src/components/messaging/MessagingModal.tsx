import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, Send, Paperclip, Smile, Check, CheckCheck, Clock, Image as ImageIcon, 
  FileText, Loader2, MessageCircle, ExternalLink, Package, Search
} from 'lucide-react';
import { useMessaging, Message } from '../../hooks/useMessaging';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  productImage?: string;
  productPrice?: string;
}

// Quick reply templates (common in e-commerce platforms)
const QUICK_REPLIES = [
  "Hi, I'm interested in this product",
  "Is this still available?",
  "What's the condition?",
  "Can I see more photos?",
  "What's the rental period?",
  "Thank you!"
];

const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  ownerId,
  ownerName,
  ownerAvatar,
  productImage,
  productPrice
}) => {
  const { user, isAuthenticated } = useAuth();
  const {
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

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatInitializedRef = useRef<string | null>(null); // Track which chat has been initialized

  // Initialize chat when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      chatInitializedRef.current = null;
      return;
    }

    if (isAuthenticated && user?.id && ownerId) {
      const chatKey = `${ownerId}-${productId}`;
      
      // Only initialize if not already initialized for this chat
      if (chatInitializedRef.current !== chatKey) {
        chatInitializedRef.current = chatKey;
        createOrGetChat(ownerId, productId).then((chat) => {
          if (chat && chat.id) {
            loadMessages(chat.id);
          }
        }).catch((err) => {
          console.error('Error initializing chat:', err);
          chatInitializedRef.current = null;
        });
      }
    }
  }, [isOpen, isAuthenticated, user?.id, ownerId, productId]); // Removed createOrGetChat and loadMessages from deps

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark chat as read when modal opens
  useEffect(() => {
    if (isOpen && currentChat && isAuthenticated) {
      markChatAsRead(currentChat.id);
    }
  }, [isOpen, currentChat, isAuthenticated, markChatAsRead]);

  // Deduplicate messages by ID
  const deduplicatedMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((message) => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }, [messages]);

  // Group messages by date (like Amazon/Alibaba)
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    deduplicatedMessages.forEach((message) => {
      const messageDate = new Date(message.created_at);
      let dateKey: string;
      
      if (isToday(messageDate)) {
        dateKey = 'Today';
      } else if (isYesterday(messageDate)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(messageDate, 'MMMM d, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  }, [deduplicatedMessages]);

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return deduplicatedMessages;
    const query = searchQuery.toLowerCase();
    return deduplicatedMessages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
  }, [deduplicatedMessages, searchQuery]);

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    if (currentChat && isAuthenticated) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setTyping(currentChat.id, true);

      typingTimeoutRef.current = setTimeout(() => {
        setTyping(currentChat.id, false);
      }, 3000);
    }
  }, [currentChat, isAuthenticated, setTyping]);

  // Send message
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!messageText.trim() || !currentChat || !isAuthenticated || sending) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText('');
    setShowQuickReplies(false);

    if (currentChat) {
      setTyping(currentChat.id, false);
    }

    try {
      await sendMessage(currentChat.id, textToSend, 'text');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [messageText, currentChat, isAuthenticated, sending, sendMessage, setTyping]);

  // Handle quick reply
  const handleQuickReply = useCallback((reply: string) => {
    setMessageText(reply);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  }, []);

  // Handle Enter key (Shift+Enter for new line)
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

  if (!isOpen) return null;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login Required</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              You must be logged in to send and receive messages from the product owner.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = '/login';
                }}
                className="flex-1"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayMessages = searchQuery ? filteredMessages : deduplicatedMessages;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-5xl w-full h-[90vh] flex flex-col">
        {/* Header - Enhanced with product context */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {ownerAvatar && (
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00aaa9]/20"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ownerName}</h3>
                  {/* Role Badge - User is always Renter when messaging from product page */}
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shrink-0">
                    You are Renter
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{productTitle}</p>
              </div>
            </div>
            
            {/* Product Link Button (like Amazon/Alibaba) */}
            <Link
              to={`/it/${productId}`}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-[#00aaa9] hover:bg-[#00aaa9]/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <Package className="w-4 h-4" />
              <span>View Product</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors ml-2"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Product Context Card (like Amazon/Alibaba show product in chat) */}
        {productImage && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={productImage}
                alt={productTitle}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{productTitle}</p>
                {productPrice && (
                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">{productPrice}</p>
                )}
              </div>
              <Link
                to={`/it/${productId}`}
                className="text-xs text-[#00aaa9] hover:underline flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                View <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar (optional, like Amazon) */}
        {messages.length > 5 && (
          <div className="px-6 py-2 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00aaa9]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages Area - Enhanced with date grouping */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-slate-800/50">
          {loading && deduplicatedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 dark:text-red-400 py-8">
              {error}
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-slate-400 py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'No messages found' : 'No messages yet'}
              </p>
              <p className="text-sm">
                {searchQuery ? 'Try a different search term' : 'Start the conversation!'}
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gray-300 dark:bg-slate-600 flex-1 w-16"></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400 px-2">
                      {dateKey}
                    </span>
                    <div className="h-px bg-gray-300 dark:bg-slate-600 flex-1 w-16"></div>
                  </div>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  const isRead = message.is_read && message.message_status === 'read';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {/* Sender name for received messages */}
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1 px-1">
                            {ownerAvatar && (
                              <img
                                src={ownerAvatar}
                                alt={ownerName}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                              {ownerName}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                            isOwnMessage
                              ? 'bg-[#00aaa9] text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-slate-600'
                          }`}
                        >
                          {/* Reply to message */}
                          {message.reply_to_message_id && (
                            <div className={`text-xs mb-2 pb-2 border-b ${isOwnMessage ? 'border-white/20 text-white/80' : 'border-gray-200 dark:border-slate-600 text-gray-500'}`}>
                              ↳ Replying to message
                            </div>
                          )}
                          
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
                          
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                          
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
                          
                          {/* Message status and timestamp */}
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
                })}
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200 dark:border-slate-600 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">{ownerName} is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies (like Amazon/Alibaba) */}
        {showQuickReplies && deduplicatedMessages.length === 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Enhanced */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
          {/* Show quick replies button for new conversations */}
          {deduplicatedMessages.length === 0 && !showQuickReplies && (
            <div className="mb-3">
              <button
                onClick={() => setShowQuickReplies(true)}
                className="text-xs text-[#00aaa9] hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Quick replies
              </button>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
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
                disabled={sending || !currentChat}
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
              disabled={!messageText.trim() || sending || !currentChat}
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
      </div>
    </div>
  );
};

export default MessagingModal;
