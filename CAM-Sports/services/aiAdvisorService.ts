import axiosInstance from '@/utils/axios';

// Customize AI Advisor
const customizeAIAdvisor = async (data: object) => {
  try {
    const response = await axiosInstance.post('/ai_advior/customize_ai_advisor', data);
    return response.data;
  } catch (error) {
    console.log('Error customizing AI Advisor:', error);
  }
};

// Send a basic AI Advisor message of type 'text'
const sendAIAdvisorTextMessage = async (data: object) => {
  try {
    const response = await axiosInstance.post('/ai_advior/message_ai_advisor', data);
    return response.data;
  } catch (error) {
    console.log('Error sending text message to AI Advisor:', error);
  }
};

// Send a basic AI Advisor message of type 'statistic_doc_id'
// {
//   "email": "player@example.com",
//   "user_type": "player",
//   "type": "statistic_doc_id",
//   "message": "67826a86889979335402a7c3"
// }

const sendAIAdvisorStatisticDocId = async (data: object) => {
  try {
    const response = await axiosInstance.post('/ai_advior/message_ai_advisor', data);
    return response.data;
  } catch (error) {
    console.log('Error sending statistic_doc_id message to AI Advisor:', error);
  }
};

// Load AI Advisor conversation history
const loadAIAdvisorHistory = async () => {
  try {
    const response = await axiosInstance.get('/ai_advior/load_conv_history');
    return response.data;
  } catch (error) {
    console.log('Error loading AI Advisor conversation history:', error);
  }
};

// Clean temporary messages
const cleanTempMessages = async (data: object) => {
  try {
    const response = await axiosInstance.post('/ai_advior/clean_temp_messages', data);
    return response.data;
  } catch (error) {
    console.log('Error cleaning temporary messages:', error);
  }
};

export {
  customizeAIAdvisor,
  sendAIAdvisorTextMessage,
  sendAIAdvisorStatisticDocId,
  loadAIAdvisorHistory,
  cleanTempMessages,
};
