# CAM-Sports Mobile Application

## Overview
CAM-Sports is a comprehensive sports management and training mobile application built with React Native and Expo. The app provides a modern, feature-rich platform for sports enthusiasts, coaches, and athletes.

## Features

### Core Features
- **User Authentication**
  - Google Sign-in integration
  - Secure user profile management
  - Session management

### Sports Management
- **Training Management**
  - Custom training programs
  - Progress tracking
  - Performance analytics

### Media Integration
- **Video Support**
  - Video playback capabilities
  - YouTube integration
  - Custom video player

### Calendar & Scheduling
- **Event Management**
  - Calendar integration
  - Event scheduling
  - Notifications for upcoming events

### AI Integration
- **AI Advisor**
  - Smart training recommendations
  - Performance analysis
  - Personalized coaching tips

### User Interface
- Modern Material UI components
- Responsive design
- Custom animations and transitions
- Dark/Light theme support

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation
1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
cd CAM-Sports
npm install
```

3. Start the development server
```bash
npm start
```

### Available Scripts
- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Run linting

## Project Structure
```
CAM-Sports/
├── app/                 # Main application screens
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── services/           # API and external service integrations
├── utils/              # Utility functions
├── constants/          # App constants and configurations
├── hooks/              # Custom React hooks
├── style/              # Global styles and themes
└── assets/             # Images, fonts, and other static assets
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please open an issue in the GitHub repository or contact the development team.

```bash
python3 -m venv venv  # on Windows, use "python -m venv venv" instead
. venv/bin/activate   # on Windows, use "venv\Scripts\activate" instead
pip3 install -r requirements.txt
```

To run:
```bash
cd backend
python3 app.py
```