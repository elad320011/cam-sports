import axiosInstance from '@/utils/axios';

interface Reminder {
    id: string;
    date: string;
    dateString: string;
}

export interface Payment {
    id: string;
    link: string;
    amount: number;
    description: string;
    due_date: string;
    team_id: string;
    reminders: {
        id: string;
        date: string;
        dateString: string;
    }[];
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentDTO {
    link: string;
    amount: number;
    description: string;
    due_date: string;
    team_id: string;
    reminders: Reminder[];
}

export const createPayment = async (paymentData: CreatePaymentDTO): Promise<Payment> => {
    try {
        const response = await axiosInstance.post('/payment/create', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

export const getPayments = async (teamId: string): Promise<Payment[]> => {
    try {
        const response = await axiosInstance.get('/payment/list', {
            params: { team_id: teamId }
        });
        return response.data.payments;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

export const getPayment = async (paymentId: string): Promise<Payment> => {
    try {
        const response = await axiosInstance.get('/payment/list', {
            params: { payment_id: paymentId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching payment:', error);
        throw error;
    }
};

export const updatePayment = async (paymentId: string, paymentData: Partial<CreatePaymentDTO>): Promise<Payment> => {
    try {
        const response = await axiosInstance.put(`/payment/${paymentId}/edit`, paymentData);
        return response.data;
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

export const deletePayment = async (paymentId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/payment/${paymentId}/delete`);
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};
