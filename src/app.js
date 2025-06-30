import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Video, 
  Users, 
  MessageCircle, 
  Share2, 
  Zap, 
  Shield, 
  Globe, 
  Play, 
  Send, 
  LogOut, 
  Copy, 
  Check,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      showNotification('Connected to server', 'success');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      showNotification('Disconnected from server', 'error');
    });

    newSocket.on('room-created', (data) => {
      setRoomIdInput(data.roomId);
      showNotification('Room created! Share the Room ID with others.', 'success');
    });

    newSocket.on('joined-room', (data) => {
      setCurrentRoom(data.roomId);
      setUsers(data.users);
      setMessages(data.messages);
      setCurrentView('meeting');
      showNotification(`Joined room ${data.roomId}`, 'success');
    });

    newSocket.on('user-joined', (data) => {
      setUsers(data.users);
      addSystemMessage(`${data.user.username} joined the room`);
    });

    newSocket.on('user-left', (data) => {
      setUsers(data.users);
      addSystemMessage(`${data.user.username} left the room`);
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    newSocket.on('error', (data) => {
      showNotification(data.message, 'error');
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), type === 'success' ? 3000 : 5000);
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now(),
      type: 'system',
      message: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createRoom = () => {
    if (!username.trim()) {
      showNotification('Please enter your name', 'error');
      return;
    }
    setCurrentUser(username);
    socket.emit('create-room');
  };

  const joinRoom = () => {
    if (!username.trim()) {
      showNotification('Please enter your name', 'error');
      return;
    }
    if (!roomIdInput.trim()) {
      showNotification('Please enter a Room ID', 'error');
      return;
    }
    setCurrentUser(username);
    socket.emit('join-room', { roomId: roomIdInput.toUpperCase(), username });
  };

  const leaveRoom = () => {
    socket.disconnect();
    socket.connect();
    setCurrentRoom(null);
    setCurrentUser('');
    setUsers([]);
    setMessages([]);
    setCurrentView('landing');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;

    socket.emit('send-message', {
      roomId: currentRoom,
      message: messageInput,
      username: currentUser
    });

    setMessageInput('');
    handleTyping(false);
  };

  const handleTyping = (isTyping = true) => {
    if (!currentRoom) return;

    clearTimeout(typingTimeoutRef.current);

    if (isTyping) {
      socket.emit('typing', {
        roomId: currentRoom,
        username: currentUser,
        isTyping: true
      });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          roomId: currentRoom,
          username: currentUser,
          isTyping: false
        });
      }, 1000);
    } else {
      socket.emit('typing', {
        roomId: currentRoom,
        username: currentUser,
        isTyping: false
      });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(currentRoom || roomIdInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (currentView === 'meeting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Meeting Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Video className="h-6 w-6 text-purple-400" />
                  Meeting Room
                </h1>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800/50 px-4 py-2 rounded-lg font-mono text-purple-300 text-lg">
                    {currentRoom}
                  </div>
                  <button
                    onClick={copyRoomId}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy ID'}
                  </button>
                </div>
              </div>
              <button
                onClick={leaveRoom}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Leave Room
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Users Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Participants ({users.length})
                </h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium truncate">
                        {user.username}
                        {user.username === currentUser && (
                          <span className="text-purple-400 text-sm ml-1">(You)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-[600px] flex flex-col">
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    Chat
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.type === 'system' ? (
                        <div className="text-center text-slate-400 text-sm py-2">
                          {message.message}
                        </div>
                      ) : (
                        <div className={`flex ${message.userId === socket?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            message.userId === socket?.id
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-slate-800/70 text-white'
                          }`}>
                            {message.userId !== socket?.id && (
                              <div className="text-purple-300 text-sm font-medium mb-1">
                                {message.username}
                              </div>
                            )}
                            <div className="break-words">{message.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div className="text-slate-400 text-sm italic">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-white/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(e);
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={500}
                    />
                    <button
                      onClick={sendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 to-pink-800/30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-purple-300 text-sm border border-white/20">
                <Sparkles className="h-4 w-4" />
                Real-time collaboration made simple
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Meet.
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect.
              </span>
              <br />
              Collaborate.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              The fastest way to start a meeting. Create rooms instantly, share with anyone, 
              and communicate in real-time with crystal-clear messaging.
            </p>

            {/* Join/Create Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto mb-12">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Room ID (optional)</label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                    placeholder="Enter Room ID"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={createRoom}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  Create New Room
                </button>
                <button
                  onClick={joinRoom}
                  className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  Join Room
                </button>
              </div>

              <div className="flex items-center justify-center mt-4 gap-2 text-sm text-slate-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">&lt;100ms</div>
                <div className="text-slate-400">Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-slate-400">Rooms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> connect</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Built for speed, designed for simplicity. Get your team together in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Setup",
                description: "Create or join rooms in one click. No downloads, no registrations required."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Private",
                description: "Room-based isolation ensures your conversations stay private and secure."
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Works Everywhere",
                description: "Access from any device, any browser. Responsive design for mobile and desktop."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Real-time Presence",
                description: "See who's online, who's typing, and when people join or leave."
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "Instant Messaging",
                description: "Crystal-clear real-time chat with typing indicators and message history."
              },
              {
                icon: <Share2 className="h-8 w-8" />,
                title: "Easy Sharing",
                description: "Share room IDs instantly. One link, unlimited participants."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-16 border border-white/20 max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of teams already using our platform for seamless real-time collaboration.
            </p>
            
            <button
              onClick={() => document.querySelector('input[placeholder="Enter your name"]').focus()}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="h-6 w-6" />
              Start Your First Meeting
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">MeetSpace</span>
          </div>
          <p className="text-slate-400">
            Built with ❤️ for seamless real-time collaboration
          </p>
        </div>
      </footer>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 backdrop-blur-lg border ${
          notification.type === 'success' 
            ? 'bg-green-600/90 text-white border-green-500/20' 
            : 'bg-red-600/90 text-white border-red-500/20'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default App;