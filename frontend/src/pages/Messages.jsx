import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";
import { Send, MessageSquare, User, Building2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';
import { useModal } from "@/components/ui/modal";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { showAlert, showConfirm, ModalComponent } = useModal();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [processingCompletion, setProcessingCompletion] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if message is a completion request
  const isCompletionRequest = (message) => {
    return (message.content.includes('requested to mark the job') || message.content.includes('marked the job')) && 
           message.content.includes('completed') &&
           message.content.includes('🎉');
  };

  // Extract job title and ID from completion request message
  const extractJobInfo = (message) => {
    const match = message.content.match(/job "([^"]+)"/);
    const title = match ? match[1] : 'this job';
    
    // Try to get job ID from conversation
    const jobId = selectedConversation?.job_id;
    
    return { title, jobId };
  };

  // Handle accepting completion
  const handleAcceptCompletion = async (message) => {
    const { title, jobId } = extractJobInfo(message);
    
    if (!jobId) {
      await showAlert({
        title: 'Error',
        message: 'Could not determine job ID',
        type: 'error'
      });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Confirm Job Completion',
      message: `Are you sure you want to confirm that "${title}" has been completed?`,
      type: 'success'
    });

    if (!confirmed) return;

    setProcessingCompletion(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/accept-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept completion');
      }

      await showAlert({
        title: 'Success',
        message: 'Job completion confirmed! The job is now complete.',
        type: 'success'
      });

      // Refresh messages to show the confirmation message
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('Error accepting completion:', error);
      await showAlert({
        title: 'Error',
        message: error.message || 'Failed to confirm completion',
        type: 'error'
      });
    } finally {
      setProcessingCompletion(false);
    }
  };

  // Handle denying completion
  const handleDenyCompletion = async (message) => {
    const { title, jobId } = extractJobInfo(message);
    
    if (!jobId) {
      await showAlert({
        title: 'Error',
        message: 'Could not determine job ID',
        type: 'error'
      });
      return;
    }

    // Prompt for reason (optional)
    const reason = prompt('Please provide a reason for denying completion (optional):');
    
    setProcessingCompletion(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/deny-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || '' })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to deny completion');
      }

      await showAlert({
        title: 'Success',
        message: 'Completion request has been denied and sent to the employer.',
        type: 'success'
      });

      // Refresh messages
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('Error denying completion:', error);
      await showAlert({
        title: 'Error',
        message: error.message || 'Failed to deny completion',
        type: 'error'
      });
    } finally {
      setProcessingCompletion(false);
    }
  };

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.error('Failed to fetch conversations:', res.status, res.statusText);
        throw new Error('Failed to fetch conversations');
      }
      const data = await res.json();
      console.log('Conversations loaded:', data);
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Don't show alert, just log and set loading to false
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to load messages',
        type: 'error'
      });
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      const sentMessage = await res.json();
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      
      // Update conversation list to reflect new message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to send message',
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#6366f1';
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
      '#f97316', '#eab308', '#84cc16', '#10b981',
      '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Show loading if user not loaded yet
  if (!user) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ModalComponent />
      <Navbar />
      
      {/* Secondary Navigation */}
      <SecondaryNav />
      
      <main className="flex-1 flex overflow-hidden">
        <Card className="flex-1 rounded-none border-0 m-0">
          <div className="flex h-full flex-col sm:flex-row">
              {/* Sidebar - Conversations List - full width on mobile when no conversation selected */}
              <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 border-r border-gray-200 flex-col`}>
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Conversations
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Loading conversations...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                      <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-sm sm:text-base text-gray-500 mb-2">No conversations yet</p>
                      <p className="text-xs sm:text-sm text-gray-400 px-4">
                        {user?.userType === 'student' 
                          ? 'Apply to jobs to start messaging with employers'
                          : 'Wait for students to apply to your jobs'}
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation)}
                        className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-indigo-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-indigo-100' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <UserAvatar 
                            user={{
                              name: conversation.other_user_name,
                              avatarColor: getAvatarColor(conversation.other_user_name)
                            }}
                            userId={conversation.other_user_id}
                            size="md"
                            className="flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate flex items-center">
                                <span className="truncate">{conversation.other_user_name}</span>
                                {user?.userType === 'student' ? (
                                  <Building2 className="w-3 h-3 ml-1 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <User className="w-3 h-3 ml-1 text-gray-500 flex-shrink-0" />
                                )}
                              </h3>
                              {conversation.last_message_time && (
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {formatTime(conversation.last_message_time)}
                                </span>
                              )}
                            </div>
                            
                            {conversation.job_title && (
                              <p className="text-xs text-indigo-600 mb-1 truncate">
                                Re: {conversation.job_title}
                              </p>
                            )}
                            
                            {conversation.last_message && (
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {conversation.last_message}
                              </p>
                            )}
                            
                            {conversation.unread_count > 0 && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                                {conversation.unread_count} new
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area - hidden on mobile when no conversation selected */}
              <div className={`${selectedConversation ? 'flex' : 'hidden sm:flex'} flex-1 flex-col w-full sm:w-auto`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Back button for mobile */}
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="sm:hidden p-2 hover:bg-gray-200 rounded-lg mr-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <UserAvatar 
                          user={{
                            name: selectedConversation.other_user_name,
                            avatarColor: getAvatarColor(selectedConversation.other_user_name)
                          }}
                          userId={selectedConversation.other_user_id}
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {selectedConversation.other_user_name}
                          </h3>
                          {selectedConversation.job_title && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              About: {selectedConversation.job_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          // Convert both to numbers for comparison
                          const isOwnMessage = Number(message.sender_id) === Number(user?.id);
                          const isCompletion = isCompletionRequest(message);
                          const isStudentReceiving = !isOwnMessage && user?.userType === 'student';
                          const showCompletionCard = isCompletion && isStudentReceiving;
                          
                          // Debug the newest message
                          if (message.content.includes('🎉')) {
                            console.log('🎉 Completion message found:', {
                              messageId: message.id,
                              senderId: message.sender_id,
                              userId: user?.id,
                              userType: user?.userType,
                              isOwnMessage,
                              isCompletion,
                              isStudentReceiving,
                              showCompletionCard
                            });
                          }
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                {showCompletionCard ? (
                                  // Completion Request Card
                                  <Card className="border-2 border-yellow-400 bg-yellow-50">
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                                            🎉 Job Completion Request
                                          </h4>
                                          <p className="text-sm text-yellow-800 mb-3">
                                            {message.content}
                                          </p>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                              onClick={() => handleAcceptCompletion(message)}
                                              disabled={processingCompletion}
                                            >
                                              <CheckCircle className="w-4 h-4" />
                                              Accept & Complete
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
                                              onClick={() => handleDenyCompletion(message)}
                                              disabled={processingCompletion}
                                            >
                                              <XCircle className="w-4 h-4" />
                                              Deny
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  // Regular Message
                                  <div
                                    className={`rounded-lg px-4 py-2 ${
                                      isOwnMessage
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                  </div>
                                )}
                                <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                  {formatTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                          disabled={sending}
                        />
                        <Button 
                          type="submit" 
                          disabled={!newMessage.trim() || sending}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
      </main>
    </div>
  );
};

export default Messages;
