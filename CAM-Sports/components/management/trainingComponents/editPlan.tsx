import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axiosInstance from "@/utils/axios";

const EditPlan = ({ route, navigation }: any) => {
    const { plan } = route.params; // Get the plan data from navigation params
    const [planName, setPlanName] = useState(plan.name);
    const [planDescription, setPlanDescription] = useState(plan.description);
    const [planSections, setPlanSections] = useState(plan.plan_sections);

    const handleSectionInputChange = (index: number, field: string, value: string) => {
        const updatedSections = [...planSections];
        updatedSections[index][field] = value;
        setPlanSections(updatedSections);
    };

    const handleSave = async () => {
        const updatedPlan = {
            id: plan.id,
            name: planName,
            description: planDescription,
            team_id: plan.team_id,
            plan_sections: planSections,
        };

        try {
            await axiosInstance.put(`/training_plans/update/${plan.id}`, updatedPlan);
            Alert.alert("Success", "Training plan updated successfully.");
            navigation.goBack(); // Navigate back to the previous screen
        } catch (error: any) {
            console.error("Error updating training plan:", error.message || error.response?.data);
            Alert.alert("Error", "An error occurred while updating the training plan.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Plan Name:</Text>
            <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="Enter plan name"
            />

            <Text style={styles.label}>Plan Description:</Text>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholder="Enter plan description"
                multiline
                textAlignVertical="top"
            />

            {planSections.map((section: any, index: number) => (
                <View key={index} style={styles.sectionContainer}>
                    <Text style={styles.label}>Section Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={section.name}
                        onChangeText={(text) => handleSectionInputChange(index, "name", text)}
                        placeholder="Enter section name"
                    />

                    <Text style={styles.label}>Section Description:</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={section.description}
                        onChangeText={(text) => handleSectionInputChange(index, "description", text)}
                        placeholder="Enter section description"
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    sectionContainer: {
        backgroundColor: "#e9e9e9",
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    saveButton: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
});
