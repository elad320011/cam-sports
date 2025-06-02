import axiosInstance from '@/utils/axios';

interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: any;
}

export const sendPushNotification = async (payload: PushNotificationPayload) => {
  try {
    await axiosInstance.post('/notifications/send', payload);
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export const registerPushToken = async (token: string, userId: string) => {
  try {
    console.log('Attempting to register push token:', { token, userId });
    const response = await axiosInstance.post('/notifications/register', {
      token,
      userId,
    });
    console.log('Push token registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error registering push token:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
}; 