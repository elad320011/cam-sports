import axios from 'axios';
import { BACKEND_URL } from '@/globalVariables';

const getTeamByCode = async (team_code: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/team/get_by_code?team_code=${team_code}`);

    return response.data;
  } catch (error) {
    console.log('Failed to get the team:', error);
    throw error;
  }
};

const updateTeam = async (data: object) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/team/update`, data);

    return response.data;
  } catch (error) {
    console.log('Failed to update team information:', error);
    throw error;
  }
};

export { 
  getTeamByCode,
  updateTeam
};
