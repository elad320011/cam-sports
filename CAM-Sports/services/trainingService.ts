import axiosInstance from "@/utils/axios";

export const deleteTrainingPlan = async (teamId: string, planId: string): Promise<void> => {
    try {
        const response = await axiosInstance.delete("/training_plans/delete", {
            data: {
                team_id: teamId,
                plan_id: planId,
            },
        });

        if (response.status === 200) {
            console.log("Training plan deleted successfully.");
        } else {
            console.error("Failed to delete the training plan.");
            throw new Error("Failed to delete the training plan.");
        }
    } catch (error: any) {
        console.error("Error deleting training plan:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "An error occurred while deleting the training plan.");
    }
};
