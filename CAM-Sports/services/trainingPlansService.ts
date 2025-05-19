import axios from 'axios';
import axiosInstance from '@/utils/axios';

const getTrainingPlans = async (teamId: string) => {
  try {
    const response = await axiosInstance.get(`/training_plans/team_id/${teamId}`);
    return response.data;
  } catch (error) {
    console.log('Failed to fetch training plans:', error);
    throw error;
  }
};

export { 
    getTrainingPlans,
};
