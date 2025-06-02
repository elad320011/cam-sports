import { Platform } from 'react-native';

export const BACKEND_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:5001"  // For Android emulator
  : "http://localhost:5001"; // For iOS simulator
// export const BACKEND_URL = "http://test.terasky-devops.com";
