import axiosInstance from '@/utils/axios';

export interface Message {
    id: string;
    content: string;
    type: 'announcement' | 'reminder';
    creator_email: string;
    created_at: string;
    last_updated: string;
}

export interface MessageBoard {
    team_id: string;
    created_at: string;
    last_updated: string;
    messages: Message[];
}

export const getTeamMessageBoard = async (teamId: string): Promise<MessageBoard> => {
    try {
        const response = await axiosInstance.get(`/message_board/${teamId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching message board:', error);
        throw error;
    }
};

export const addMessage = async (teamId: string, content: string, type: string, creator_email:string): Promise<MessageBoard> => {
    try {
        // First, add the message
        const response = await axiosInstance.post(`/message_board/${teamId}/messages`, {
            content,
            type,
            creator_email: creator_email
        });

        // Then, send push notification to all team members
        await axiosInstance.post('/notifications/send', {
            to: teamId,
            title: type === 'announcement' ? 'New Announcement' : 'New Reminder',
            body: content,
            data: {
                type: 'message',
                messageType: type,
                teamId: teamId
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error adding message:', error);
        throw error;
    }
};

export const updateMessage = async (teamId: string, messageIndex: number, content: string, type: string): Promise<MessageBoard> => {
    try {
        const response = await axiosInstance.put(`/message_board/${teamId}/messages/${messageIndex}`, {
            content,
            type
        });
        return response.data;
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
};

export const deleteMessage = async (teamId: string, messageIndex: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/message_board/${teamId}/messages/${messageIndex}`);
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
}; 