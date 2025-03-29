import axios from 'axios';
import axiosInstance from '@/utils/axios';

const getTeamGameStatistics = async (teamId: string) => {
  try {
    const response = await axiosInstance.get(`/game_statistics/team_id/${teamId}`);
    return response.data;
  } catch (error) {
    console.log('Failed to fetch team game statistics:', error);
    throw error;
  }
};

export { 
    getTeamGameStatistics,
};
