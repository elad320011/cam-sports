import axiosInstance from '@/utils/axios';

interface RoleInfo {
    player_id: string | null;
    name: string;
    instructions: string;
}

interface Formation {
    id: string;
    name: string;
    team_id: string;
    roles: {
        role_1: RoleInfo;
        role_2: RoleInfo;
        role_3: RoleInfo;
        role_4: RoleInfo;
        role_5: RoleInfo;
        role_6: RoleInfo;
    };
}

interface FormationsResponse {
    formations: Formation[];
}

export const getTeamFormations = async (teamId: string): Promise<FormationsResponse> => {
    try {
        const response = await axiosInstance.get('/formations/list', {
            params: { team_id: teamId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching team formations:', error);
        throw error;
    }
}; 