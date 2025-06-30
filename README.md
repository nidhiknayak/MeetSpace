# 🎥 KALEIDOSCOPE - Real-time Meeting Platform

A modern, fast, and intuitive real-time meeting platform built with Node.js, React, and Socket.IO. Create instant meeting rooms, chat in real-time, and collaborate seamlessly.

![MeetSpace Demo](https://img.shields.io/badge/Status-Ready%20to%20Deploy-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18%2B-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7%2B-black)

## ✨ Features

### 🎯 Core Functionality
- **🚀 Instant Room Creation** - Generate unique room IDs in one click
- **🔗 Easy Room Joining** - Join any room with just a Room ID
- **💬 Real-time Messaging** - WebSocket-powered instant communication
- **🏠 Room Isolation** - Messages are private to each room

### 🎁 Bonus Features
- **👥 Live User List** - See all connected participants
- **📢 Join/Leave Notifications** - Real-time presence updates
- **⌨️ Typing Indicators** - Know when others are typing
- **📝 Message History** - Persistent chat history per session
- **📋 Copy Room ID** - Easy sharing with one click
- **📱 Responsive Design** - Works on desktop and mobile
- **🎨 Modern UI** - Beautiful gradient design with smooth animations

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React 18 + Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Real-time**: WebSocket (Socket.IO)
- **Storage**: In-memory (no database required)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project**
```bash
git clone <repository-url>
cd online-meeting-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the React app**
```bash
npm run build
```

4. **Start the server**
```bash
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

## 🎮 How to Use

### Creating a Room
1. Enter your name
2. Click "Create New Room"
3. Copy the generated Room ID
4. Share it with others

### Joining a Room
1. Enter your name
2. Enter the Room ID
3. Click "Join Room"
4. Start chatting!

### Testing with Multiple Users
1. Open multiple browser tabs/windows
2. Use different names
3. Join the same room
4. Test real-time messaging

## 📁 Project Structure

```
online-meeting-platform/
├── server.js              # Backend server with Socket.IO
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html         # HTML template
│   └── manifest.json      # Web app manifest
├── src/
│   ├── App.js             # Main React component
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── build/                 # Built React app (after npm run build)
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Build React app for production
npm run build

# Run tests
npm test
```

### Development Mode
For development, you can run the React app and server separately:

```bash
# Terminal 1: Start React dev server
npm run dev-client

# Terminal 2: Start Node server with nodemon
npm run dev-server
```

## 🌐 API Endpoints

### WebSocket Events

#### Client → Server
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `send-message` - Send a message to room
- `typing` - Send typing indicator
- `get-room-info` - Get room information

#### Server → Client
- `room-created` - Room creation confirmation
- `joined-room` - Room join confirmation
- `user-joined` - New user joined notification
- `user-left` - User left notification
- `new-message` - New message received
- `user-typing` - Typing indicator update
- `error` - Error message

## 🔒 Security Features

- **Room Isolation**: Messages are scoped to specific rooms
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents spam and abuse
- **XSS Protection**: Safe message rendering
- **CORS Configuration**: Secure cross-origin requests

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds and glass morphism
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Mobile-first design
- **Dark Theme**: Easy on the eyes
- **Intuitive Interface**: Simple and clean user experience
- **Real-time Feedback**: Instant visual updates

## 📊 Performance

- **Lightweight**: Minimal dependencies
- **Fast**: Optimized WebSocket connections
- **Scalable**: Room-based architecture
- **Efficient**: In-memory storage for speed

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **React app not loading**
   ```bash
   # Rebuild the React app
   npm run build
   ```

3. **WebSocket connection failed**
   - Check if server is running
   - Verify firewall settings
   - Try different browser

## 🚀 Deployment

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Socket.IO for real-time communication
- React team for the awesome framework
- Tailwind CSS for rapid styling
- Lucide React for beautiful icons

---

**Built with ❤️ for seamless real-time collaboration**

For questions or support, please open an issue or contact the development team.