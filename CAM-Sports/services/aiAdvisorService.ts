import axios from 'axios';
import { BACKEND_URL } from '@/globalVariables';

// Customize AI Advisor
const customizeAIAdvisor = async (custom_info: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/ai_advior/customize_ai_advisor`, { custom_info });
    return response.data;
  } catch (error) {
    console.log('Error customizing AI Advisor:', error);
  }
};

// Send a basic AI Advisor message of type 'text'
const sendAIAdvisorTextMessage = async (message: object) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/ai_advior/message_ai_advisor`, {
      type: 'text',
      message: JSON.stringify(message),
    });
    return response.data;
  } catch (error) {
    console.log('Error sending text message to AI Advisor:', error);
  }
};

// Send a basic AI Advisor message of type 'statistic_doc_id'
const sendAIAdvisorStatisticDocId = async (docId: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/ai_advior/message_ai_advisor`, {
      type: 'statistic_doc_id',
      message: docId,
    });
    return response.data;
  } catch (error) {
    console.log('Error sending statistic_doc_id message to AI Advisor:', error);
  }
};

// Load AI Advisor conversation history
const loadAIAdvisorHistory = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/ai_advior/load_conv_history`);
    return response.data;
  } catch (error) {
    console.log('Error loading AI Advisor conversation history:', error);
  }
};

export {
  customizeAIAdvisor,
  sendAIAdvisorTextMessage,
  sendAIAdvisorStatisticDocId,
  loadAIAdvisorHistory,
};
