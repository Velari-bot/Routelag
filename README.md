# Routelag

A desktop application for game optimization and route selection, built with Electron, React, TypeScript, and Firebase.

## 🎯 Features

- **Firebase Authentication**: Secure login/register system
- **Game Optimization**: Select and optimize routes for popular games
- **Live Ping Monitoring**: Real-time ping graph with optimization status
- **Server Selection**: Choose from multiple server locations
- **Dark Theme UI**: Modern, ExitLag-inspired interface
- **System Integration**: PowerShell commands for low latency mode

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron 27
- **Backend**: Node.js (system commands)
- **Authentication & Database**: Firebase (Auth & Firestore)
- **Build Tool**: Create React App

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd routelag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update `src/utils/firebase.ts` with your Firebase config

4. **Configure Firebase**
   ```typescript
   // src/utils/firebase.ts
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

## 🚀 Development

### Start Development Server
```bash
npm run electron-dev
```

This will start both the React development server and Electron app with hot reload.

### Build for Production
```bash
npm run electron-pack
```

This will build the React app and package it with Electron for distribution.

## 📁 Project Structure

```
routelag/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # IPC bridge (secure)
├── public/
│   └── index.html       # Main HTML file
├── src/
│   ├── components/
│   │   ├── Login.tsx    # Authentication component
│   │   ├── GameList.tsx # Game selection
│   │   ├── RouteSelect.tsx # Server selection
│   │   ├── PingGraph.tsx # Live ping monitoring
│   │   └── Tabs.tsx     # Navigation tabs
│   ├── utils/
│   │   ├── firebase.ts  # Firebase configuration
│   │   └── systemCommands.ts # System utilities
│   ├── App.tsx          # Main React component
│   ├── index.tsx        # React entry point
│   └── index.css        # Tailwind styles
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies and scripts
```

## 🎮 Supported Games

- Counter-Strike 2
- Fortnite
- Rocket League
- Rust

## 🌐 Server Locations

- NA-East (New York)
- NA-Central (Chicago)
- NA-West (Los Angeles)
- EU-West (London)
- EU-Central (Frankfurt)

## 🔧 System Requirements

- Windows 10/11
- Node.js 16+
- npm or yarn

## 🚨 Important Notes

- **Administrator Rights**: Some features require administrator privileges for system-level optimizations
- **Firewall**: The app may need firewall permissions for ping functionality
- **Antivirus**: Some antivirus software may flag system commands as suspicious

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify your Firebase configuration in `src/utils/firebase.ts`
   - Check if Authentication and Firestore are enabled

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Update dependencies: `npm update`

3. **Electron Build Issues**
   - Ensure you have the correct Node.js version
   - Try rebuilding Electron: `npm run build-electron`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub. 