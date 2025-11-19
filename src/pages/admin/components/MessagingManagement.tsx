import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Send, 
  Bot, 
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  FileText} from 'lucide-react';
import { MessagingService } from '../service/messagingService';
import handoverReturnService from '../../../services/handoverReturnService';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
// Local lightweight types to avoid external dependency
type Chat = {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: { content?: string };
  isActive?: boolean;
  type?: string;
  unreadCount?: number;
  updatedAt: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
};

type MessageTemplate = {
  id: string;
  name: string;
  content: string;
  category: 'general' | 'booking' | 'support' | 'custom';
  language: string;
  usageCount: number;
  updatedAt: string;
};

type AdminMessageStats = {
  totalMessages?: number;
  activeChats?: number;
  averageResponseTime?: number;
  messagesToday?: number;
  topChatCategories?: Array<{ category: string; count: number; percentage: number }>;
  sentimentDistribution?: Array<{ emotion: string; count: number; percentage: number }>;
} | null;

interface MessagingManagementProps {
  // Add props for messaging data as needed
}

const MessagingManagement: React.FC<MessagingManagementProps> = () => {
  const { tSync } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'templates' | 'ai-features' | 'handover-return'>('overview');
  const [hrView, setHrView] = useState<'all' | 'handover' | 'return'>('all');
  const [hrMessages, setHrMessages] = useState<any[]>([]);
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError] = useState<string | null>(null);
  const [chats] = useState<Chat[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [messageStats] = useState<AdminMessageStats>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  
  // Chat management
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Template management
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    category: 'general' as 'general' | 'booking' | 'support' | 'custom',
    language: 'en'
  });

  // AI features
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [sentimentAnalysis] = useState<any>(null);
  const [conflictDetection, setConflictDetection] = useState<any>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // fetchData();
  }, []);

  // const fetchData = async () => {
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const [chatsResult, templatesResult, statsResult] = await Promise.all([
  //       MessagingService.getChats(token || undefined),
  //       MessagingService.getMessageTemplates(token || undefined),
  //       MessagingService.getMessageStats(token || undefined)
  //     ]);

  //     if (chatsResult.error) setError(chatsResult.error);
  //     else setChats(chatsResult.data);

  //     if (templatesResult.error) setError(templatesResult.error);
  //     else setTemplates(templatesResult.data);

  //     if (statsResult.error) setError(statsResult.error);
  //     else setMessageStats(statsResult.data);

  //   } catch (err) {
  //     setError('Failed to fetch messaging data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadHandoverReturnMessages = async () => {
    setHrLoading(true);
    setHrError(null);
    try {
      const res = await handoverReturnService.getAdminMessages({
        view: hrView === 'all' ? undefined : (hrView as 'handover' | 'return'),
        page: 1,
        limit: 50,
      });
      // Normalize to display shape similar to sample
      const items = (res.data || []).map((m: any) => ({
        id: m.id,
        sessionId: m.sessionId,
        sessiontype: m.sessiontype || m.sessionType || m.type,
        bookingId: m.bookingId,
        senderId: m.senderId,
        senderType: m.senderType,
        message: m.message || m.content,
        messageType: m.messageType || m.type || 'text',
        attachments: m.attachments || [],
        timestamp: m.timestamp || m.sentAt,
      }));
      setHrMessages(items);
    } catch (e: any) {
      setHrError(e?.message || 'Failed to load messages');
    } finally {
      setHrLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'handover-return') {
      loadHandoverReturnMessages();
    }
  }, [activeTab, hrView]);

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    const messagesResult = await MessagingService.getChatMessages(chat.id, 1, 50, token || undefined);
    if (messagesResult.data) {
      setChatMessages(messagesResult.data);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      type: 'text' as const,
      senderId: 'admin', // This should come from user context
      senderName: 'Admin'
    };

    const result = await MessagingService.sendMessage(selectedChat.id, messageData, token || undefined);
    if (result.data) {
      setChatMessages(prev => [result.data!, ...prev]);
      setNewMessage('');
    }
  };

  const handleCreateTemplate = async () => {
    const result = await MessagingService.createMessageTemplate(templateForm, token || undefined);
    if (result.data) {
      setTemplates(prev => [...prev, result.data!]);
      setShowTemplateModal(false);
      setTemplateForm({ name: '', content: '', category: 'general', language: 'en' });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    const result = await MessagingService.updateMessageTemplate(editingTemplate.id, templateForm, token || undefined);
    if (result.data) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.data! : t));
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', content: '', category: 'general', language: 'en' });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const result = await MessagingService.deleteMessageTemplate(templateId, token || undefined);
      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    }
  };

  // sentiment analysis handler can be re-enabled when UI adds trigger

  const handleDetectConflict = async (chatId: string) => {
    const result = await MessagingService.detectConflict(chatId, token || undefined);
    if (result.data) {
      setConflictDetection(result.data);
    }
  };

  const handleGenerateSuggestions = async (chatId: string, context: string) => {
    const result = await MessagingService.generateResponseSuggestions(chatId, context, token || undefined);
    if (result.data) {
      setAiSuggestions(result.data);
    }
  };

  const filteredChats = chats.filter((chat: Chat) => {
    if (chatFilter === 'all') return true;
    if (chatFilter === 'active' && chat.isActive) return true;
    if (chatFilter === 'support' && chat.type === 'support') return true;
    if (chatFilter === 'unread' && Number((chat.unreadCount as number) || 0) > 0) return true;
    return false;
  }).filter((chat: Chat) => 
    chat.participantNames[chat.participants[0]]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary mx-auto mb-4"></div>
            <p className="text-gray-500">
              <TranslatedText text="Loading messaging data..." />
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg text-red-600 mb-2">
            <TranslatedText text="Error loading messaging data" />
          </p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <TranslatedText text="Try Again" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          <TranslatedText text="Messaging Management" />
        </h3>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            <TranslatedText text="Filter" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[ 
            { id: 'overview', label: tSync('Overview'), icon: TrendingUp },
            { id: 'chats', label: tSync('Chats'), icon: MessageSquare },
            { id: 'templates', label: tSync('Templates'), icon: FileText },
            { id: 'ai-features', label: tSync('AI Features'), icon: Bot },
            { id: 'handover-return', label: tSync('Handover & Return'), icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-my-primary text-my-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <TranslatedText text="Total Messages" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats?.totalMessages || 0}</p>
                  </div>
                  <div className="p-3 bg-my-primary/10 rounded-full">
                    <MessageSquare className="w-6 h-6 text-my-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <TranslatedText text="Active Chats" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats?.activeChats || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <TranslatedText text="Avg Response Time" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats?.averageResponseTime || 0}m</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <TranslatedText text="Messages Today" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats?.messagesToday || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <TranslatedText text="Chat Categories" />
                </h3>
                <div className="space-y-3">
                  {messageStats?.topChatCategories?.map((category: { category: string; count: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-my-primary h-2 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <TranslatedText text="Sentiment Distribution" />
                </h3>
                <div className="space-y-3">
                  {messageStats?.sentimentDistribution?.map((sentiment: { emotion: string; count: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{sentiment.emotion}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-my-primary h-2 rounded-full" 
                            style={{ width: `${sentiment.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{sentiment.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Recent Activity" />
              </h3>
              <div className="space-y-3">
                {chats.slice(0, 5).map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-my-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-my-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {chat.participantNames[chat.participants[0]] || tSync('Unknown User')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(chat.lastMessage?.content?.substring(0, 50) || tSync('No messages yet'))}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                      {Number((chat.unreadCount as number) || 0) > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-my-primary text-white">
                          {Number((chat.unreadCount as number) || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={tSync('Search chats...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none outline-none text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  {['all', 'active', 'support', 'unread'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setChatFilter(filter)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        chatFilter === filter
                          ? 'bg-my-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tSync(filter.charAt(0).toUpperCase() + filter.slice(1))}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedChat?.id === chat.id ? 'bg-my-primary/5 border-l-4 border-l-my-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {chat.participantNames[chat.participants[0]] || tSync('Unknown User')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(chat.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage?.content || tSync('No messages yet')}
                    </p>
                    {Number((chat.unreadCount as number) || 0) > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-my-primary text-white mt-2">
                        {Number((chat.unreadCount as number) || 0)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow">
              {selectedChat ? (
                <div className="flex flex-col h-96">
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedChat.participantNames[selectedChat.participants[0]] || tSync('Unknown User')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedChat.type} • {selectedChat.participants.length} participants
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDetectConflict(selectedChat.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          title={tSync('Detect Conflict')}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateSuggestions(selectedChat.id, tSync('Generate response suggestions'))}
                          className="p-2 text-gray-400 hover:text-blue-500 hover.bg-blue-50 rounded-full"
                          title={tSync('AI Suggestions')}
                        >
                          <Bot className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 'admin'
                              ? 'bg-my-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 'admin' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={tSync('Type a message...')}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p><TranslatedText text="Select a chat to start messaging" /></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Template Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  <TranslatedText text="Message Templates" />
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatedText text="Manage pre-built message templates for common scenarios" />
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                <TranslatedText text="New Template" />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.category === 'booking' ? 'bg-blue-100 text-blue-800' :
                          template.category === 'support' ? 'bg-green-100 text-green-800' :
                          template.category === 'general' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {template.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {template.language}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setTemplateForm({
                            name: template.name,
                            content: template.content,
                            category: template.category,
                            language: template.language
                          });
                          setShowTemplateModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span><TranslatedText text="Used" /> {template.usageCount} <TranslatedText text="times" /></span>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-features' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4"><TranslatedText text="AI-Powered Features" /></h3>
              <p className="text-sm text-gray-600"><TranslatedText text="Leverage artificial intelligence to improve messaging efficiency and user experience" /></p>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4"><TranslatedText text="Response Suggestions" /></h4>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
                {aiSuggestions.length === 0 && (
                  <p className="text-gray-500 text-sm"><TranslatedText text="No suggestions generated yet. Select a chat and use the AI suggestions button." /></p>
                )}
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4"><TranslatedText text="Sentiment Analysis" /></h4>
              {sentimentAnalysis ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600"><TranslatedText text="Emotion" />:</span>
                    <span className="font-medium text-gray-900 capitalize">{sentimentAnalysis.emotion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600"><TranslatedText text="Confidence" />:</span>
                    <span className="font-medium text-gray-900">{(sentimentAnalysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600"><TranslatedText text="Score" />:</span>
                    <span className="font-medium text-gray-900">{sentimentAnalysis.score.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm"><TranslatedText text="No sentiment analysis performed yet. Select a message and use the sentiment analysis feature." /></p>
              )}
            </div>

            {/* Conflict Detection */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4"><TranslatedText text="Conflict Detection" /></h4>
              {conflictDetection ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600"><TranslatedText text="Risk Level" />:</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      conflictDetection.level === 'critical' ? 'bg-red-100 text-red-800' :
                      conflictDetection.level === 'high' ? 'bg-orange-100 text-orange-800' :
                      conflictDetection.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {conflictDetection.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600"><TranslatedText text="Confidence" />:</span>
                    <span className="font-medium text-gray-900">{(conflictDetection.confidence * 100).toFixed(1)}%</span>
                  </div>
                  {conflictDetection.indicators.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600"><TranslatedText text="Indicators" />:</span>
                      <div className="mt-2 space-y-1">
                        {conflictDetection.indicators.map((indicator: string, index: number) => (
                          <div key={index} className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                            • {indicator}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm"><TranslatedText text="No conflict detection performed yet. Select a chat and use the conflict detection feature." /></p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'handover-return' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="Handover & Return Messages" /></h3>
              <div className="flex items-center gap-2">
                {(['all','handover','return'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setHrView(v)}
                    className={`px-3 py-1 text-xs rounded-full ${hrView === v ? 'bg-my-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {v === 'all' ? <TranslatedText text="All" /> : v === 'handover' ? <TranslatedText text="Handover" /> : <TranslatedText text="Return" />}
                  </button>
                ))}
                <button
                  onClick={loadHandoverReturnMessages}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  <TranslatedText text="Refresh" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border">
              {hrLoading && (
                <div className="p-4 text-sm text-gray-500"><TranslatedText text="Loading…" /></div>
              )}
              {hrError && (
                <div className="p-4 text-sm text-red-600">{hrError}</div>
              )}
              {!hrLoading && !hrError && (
                <div className="divide-y">
                  {hrMessages.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500"><TranslatedText text="No messages found." /></div>
                  ) : (
                    hrMessages.map((m) => (
                      <div key={m.id} className="p-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`${m.sessiontype === 'return' 
                              ? 'px-2 py-0.5 rounded-full bg-purple-700 text-white ring-1 ring-purple-800'
                              : 'px-2 py-0.5 rounded-full bg-teal-700 text-white ring-1 ring-teal-800'}`}>
                              {(m.sessiontype || 'handover').toUpperCase()}
                            </span>
                            <span><TranslatedText text="Booking" />: {m.bookingId?.slice(0,8)}…</span>
                            <span><TranslatedText text="Sender" />: {m.senderType || m.senderId?.slice(0,6)}</span>
                          </div>
                          <span>{new Date(m.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">{m.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTemplate ? <TranslatedText text="Edit Template" /> : <TranslatedText text="New Template" />}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText text="Name" /></label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText text="Category" /></label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-transparent"
                >
                  <option value="general"><TranslatedText text="General" /></option>
                  <option value="booking"><TranslatedText text="Booking" /></option>
                  <option value="support"><TranslatedText text="Support" /></option>
                  <option value="custom"><TranslatedText text="Custom" /></option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText text="Language" /></label>
                <select
                  value={templateForm.language}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText text="Content" /></label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                  setTemplateForm({ name: '', content: '', category: 'general', language: 'en' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <TranslatedText text="Cancel" />
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                disabled={!templateForm.name.trim() || !templateForm.content.trim()}
                className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingTemplate ? <TranslatedText text="Update" /> : <TranslatedText text="Create" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingManagement; 