import axios from 'axios';
import { BACKEND_URL } from '@/globalVariables';

const getTeamGameStatistics = async (teamId: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/game_statistics/team_id/${teamId}`);
    return response.data;
  } catch (error) {
    console.log('Failed to fetch team game statistics:', error);
    throw error;
  }
};

export { 
    getTeamGameStatistics,
};
