import React, { useCallback, useState } from "react";
import { Text, StyleSheet, View, Image, Button, Alert } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import PlanForm from "./planForm";
import axiosInstance from "@/utils/axios";

type sources = {
    source_type: string;
    source_url: string;
};

type plan_sections = {
    name: string;
    description: string;
    sources: sources[];
};

export type PlanProps = {
    id: string;
    name: string;
    plan_sections: plan_sections[];
    description: string;
    team_id: string; // Add team_id to props for the delete request
};

export default function Plan(props: PlanProps & { onDelete?: () => void }) {
    const [playing, setPlaying] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [planData, setPlanData] = useState<PlanProps>(props); // Local state for plan data

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    const handleDelete = async (planId: string) => {
        try {
            const response = await axiosInstance.delete('/training_plans/delete', {
                data: { team_id: planData.team_id, plan_id: planId }, // Pass payload in the request body
            });
            if (response.status === 200) {
                Alert.alert("Success", "Training plan deleted successfully.");
                if (props.onDelete) {
                    props.onDelete(); // Collapse the training plans
                }
            }
        } catch (error: any) {
            console.log("An error occurred while deleting the training plan:", error.message || error);
        }
    };

    const handleUpdate = (updatedPlan: PlanProps) => {
        setPlanData(updatedPlan); // Update the local state with the new values
        setEditMode(false); // Exit edit mode
    };

    return (
        <View>
            {editMode ? (
                <PlanForm
                    setAddMode={setEditMode}
                    initialData={planData} // Pass the current plan data to the form
                    onUpdate={handleUpdate} // Callback to handle updates
                />
            ) : (
                <>
                    <Text style={styles.plan_description}>{planData.description}</Text>
                    {planData.plan_sections.map((item, index) => (
                        <View key={`section-${index}`}>
                            <View style={styles.section}>
                                <Text style={styles.drill_name}>{item.name}</Text>
                                <Text style={styles.drill_description}>{item.description}</Text>

                                {item.sources.map((source, sourceIndex) => (
                                    <View key={`source-${index}-${sourceIndex}`}>
                                        {source.source_type === "Video" && (
                                            <YoutubePlayer
                                                height={200}
                                                play={playing}
                                                videoId={source.source_url}
                                                onChangeState={onStateChange}
                                            />
                                        )}
                                        {source.source_type === "Image" && (
                                            <Image
                                                source={{ uri: source.source_url }}
                                                style={styles.drill_image}
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Edit Plan"
                                    color="blue"
                                    onPress={() => setEditMode(true)}
                                />
                                <Button
                                    title="Delete Plan"
                                    color="red"
                                    onPress={() => handleDelete(planData.id)}
                                />
                            </View>
                        </View>
                    ))}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 20,
        position: "relative",
    },
    plan_description: {
        fontSize: 22,
        textAlign: "center",
        margin: 20,
    },
    drill_name: {
        fontSize: 18,
        textAlign: "center",
    },
    drill_description: {
        margin: 20,
        fontSize: 16,
        textAlign: "center",
    },
    drill_image: {
        height: 200,
        resizeMode: "contain",
    },
    buttonContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
