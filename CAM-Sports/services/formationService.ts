import axiosInstance from '@/utils/axios';

interface RoleInfo {
    player_id: string | null;
    name: string;
    instructions: string;
}

export interface PlayerInfo {
    id: string;
    fullName: string;
}

export interface Formation {
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

export const getTeamPlayers = async (teamId: string): Promise<PlayerInfo[]> => {
    try {
        const response = await axiosInstance.get('/team/get_players', {
            params: { team_name: teamId }
        });
        
        if (response.status === 200) {
            const rawPlayers: string[] = response.data.players;
            return rawPlayers.map((raw: string) => {
                try {
                    const obj = JSON.parse(raw);
                    return {
                        id: obj._id.$oid,
                        fullName: obj.full_name || 'Unnamed Player'
                    };
                } catch (err) {
                    return { id: '', fullName: 'Unnamed Player' };
                }
            });
        }
        return [];
    } catch (error) {
        console.error('Error fetching team players:', error);
        throw error;
    }
};

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

export const getFormation = async (formationId: string): Promise<Formation> => {
    try {
        const response = await axiosInstance.get(`/formations/${formationId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formation:', error);
        throw error;
    }
};

export const createFormation = async (name: string, teamId: string): Promise<Formation> => {
    try {
        const response = await axiosInstance.post('/formations/create', {
            name,
            team_id: teamId
        });
        return response.data;
    } catch (error) {
        console.error('Error creating formation:', error);
        throw error;
    }
};

export const updateFormation = async (formationId: string, name: string, roles: Formation['roles']): Promise<void> => {
    try {
        await axiosInstance.put(`/formations/${formationId}/edit`, {
            name,
            roles
        });
    } catch (error) {
        console.error('Error updating formation:', error);
        throw error;
    }
};

export const updatePlayerRole = async (
    formationId: string,
    roleNumber: number,
    playerId: string,
    instructions: string
): Promise<void> => {
    try {
        const roleKey = `role_${roleNumber}`;
        await axiosInstance.put(`/formations/${formationId}/edit`, {
            roles: {
                [roleKey]: {
                    player_id: playerId,
                    instructions
                }
            }
        });
    } catch (error) {
        console.error('Error updating player role:', error);
        throw error;
    }
}; 
