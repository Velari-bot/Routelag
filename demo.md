# Routelag Demo Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Firebase (Required)
Before running the app, you need to set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Get your config and update `src/utils/firebase.ts`

### 3. Run in Development Mode
```bash
npm run electron-dev
```

This will:
- Start the React development server on http://localhost:3000
- Launch the Electron app with hot reload
- Open DevTools automatically

### 4. Build for Production
```bash
npm run electron-pack
```

This creates a distributable package in the `build` folder.

## 🎮 App Features Demo

### Login Page
- Email/password authentication
- Register new account
- Dark theme with purple accents

### Games Tab
- List of supported games (CS2, Fortnite, Rocket League, Rust)
- Click any game to proceed to route selection

### Routes Tab
- Server selection with ping information
- Optimize button triggers route optimization
- Shows optimization results

### Monitor Tab
- Live ping graph (simulated)
- Toggle optimization on/off
- Real-time ping monitoring
- End optimization button

## 🔧 System Integration

The app includes mock system commands that simulate:
- Ping testing
- Route optimization
- Low latency mode toggle (PowerShell registry commands)

In a real implementation, these would execute actual system commands through Electron's IPC.

## 🎨 UI Features

- **Dark Theme**: ExitLag-inspired dark interface
- **Responsive Design**: Works on different window sizes
- **Smooth Animations**: Loading states and transitions
- **Modern Icons**: Emoji-based game icons
- **Status Indicators**: Color-coded ping and optimization status

## 🐛 Troubleshooting

If you encounter issues:

1. **Firebase Errors**: Check your Firebase configuration
2. **Build Errors**: Run `npm run build` to check React compilation
3. **Electron Errors**: Run `npm run build-electron` to check main process
4. **Dependency Issues**: Use `npm install --legacy-peer-deps`

## 📝 Notes

- The app uses mock data for demonstration
- Firebase configuration is required for authentication
- System commands are simulated for safety
- All ping data is generated randomly for demo purposes 