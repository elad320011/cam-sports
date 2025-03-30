import React, { useCallback, useState } from "react";
import { Text, StyleSheet, View, Image, Button, Alert } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { deleteTrainingPlan } from "@/services/trainingService";

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

export default function Plan(props: PlanProps) {
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    const handleDelete = async (planId: string) => {
        try {
            await deleteTrainingPlan(props.team_id, planId);
            Alert.alert("Success", "Training plan deleted successfully.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "An error occurred while deleting the training plan.");
        }
    };

    return (
        <View>
            <Text style={styles.plan_description}>{props.description}</Text>
            {props.plan_sections.map((item, index) => (
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

                    {/* Delete Button Positioned Outside the Square */}
                    <View style={styles.deleteButtonContainer}>
                        <Button
                            title="Delete Plan"
                            color="red"
                            onPress={() => {
                                console.log("Delete button clicked for planId:", props.id); // Debugging log
                                Alert.alert(
                                    "Confirm Delete",
                                    "Are you sure you want to delete this plan?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Delete", onPress: () => handleDelete(props.id) },
                                    ]
                                );
                            }}
                        />
                    </View>
                </View>
            ))}
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
    deleteButtonContainer: {
        marginTop: 10,
        alignItems: "flex-end",
    },
});
