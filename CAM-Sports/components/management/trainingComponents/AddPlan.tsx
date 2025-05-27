import { useState } from 'react';
import { PlanProps, plan_sections } from "./assets";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Modal from 'react-native-modal';
import { Card, Divider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import axiosInstance from '@/utils/axios';

interface Source {
    source_type: "Video" | "Image";
    source_url: string;
}

interface SectionInput {
    name: string;
    description: string;
    sources: Source[];
}

export function AddPlan(props: any) {

    const { team_id, currentMode, setCurrentMode } = props;
    const [planName, setPlanName] = useState<string>("");
    const [planDescription, setPlanDescription] = useState<string>("");
    const [currentPhase, setCurrentPhase] = useState<"name" | "description" | "sections">("name");
    const [sectionsInput, setSectionsInput] = useState<SectionInput[]>([]);
    const [currentSection, setCurrentSection] = useState<SectionInput>({ name: "", description: "", sources: [] });
    const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
    const [newSourceName, setNewSourceName] = useState<string>("");
    const [newSourceUrl, setNewSourceUrl] = useState<string>("");
    const [newSourceType, setNewSourceType] = useState<"Video" | "Image">("Video");

    const addSection = () => {
        setSectionsInput([...sectionsInput, currentSection]);
        setCurrentSection({ name: "", description: "", sources: [] });
        setIsAddingSection(false);
    };

    const addSourceToCurrentSection = () => {
        const newSource = { source_type: newSourceType, source_url: newSourceUrl };
        setCurrentSection({ ...currentSection, sources: [...currentSection.sources, newSource] });
        setNewSourceName("");
        setNewSourceUrl("");
    };

    const removeSection = (index: number) => {
        const newSections = [...sectionsInput];
        newSections.splice(index, 1);
        setSectionsInput(newSections);
    };

    const removeSourceFromCurrentSection = (index: number) => {
        const newSources = [...currentSection.sources];
        newSources.splice(index, 1);
        setCurrentSection({ ...currentSection, sources: newSources });
    };

    const savePlan = async () => {
        const newPlan: any = {
            name: planName,
            description: planDescription,
            plan_sections: sectionsInput.map(section => ({
                name: section.name,
                description: section.description,
                sources: section.sources
            })),
            team_id: team_id
        };
        console.log("Saving plan:", newPlan);

        const response = await axiosInstance.post('/training_plans/create', newPlan, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.message) {
            console.log("Plan saved successfully");
        } else {
            console.error("Failed to save plan", response.data);
        }

        // Reset the form after saving
        setPlanName("");
        setPlanDescription("");
        setSectionsInput([]);
        setCurrentPhase("name");
        setIsAddingSection(false);
        setCurrentSection({ name: "", description: "", sources: [] });
        setNewSourceUrl("");
        setNewSourceType("Video");
        setCurrentMode(undefined);
    };

    return (
        <Modal
            isVisible={currentMode == "Add"}
            animationIn="bounceInUp"
            hasBackdrop={true}
            onBackdropPress={() => setCurrentMode(undefined)}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Card style={{ backgroundColor: '#0c1c2c', width: '80%' }}>
                    <Card.Title
                        title="Add Training Plan"
                        titleStyle={{ fontSize: 20, marginTop: 10, fontWeight: 'bold', color: 'white', textAlign: 'center', paddingTop: 30 }}
                    />
                    <Divider style={{ margin: 15 }} />
                    <Card.Content>
                        {(currentPhase === "name" || currentPhase == "description") && (
                            <View>
                                <Text style={{ color: '#cdd1ce', textAlign: 'center', paddingBottom: 20 }}>
                                    Lets start with the basics
                                </Text>

                                {currentPhase === "name" ?
                                    (
                                        <View>
                                            <TextInput
                                                placeholderTextColor="#cdd1ce"
                                                style={styles.input}
                                                placeholder="Plan Name"
                                                value={planName}
                                                onChangeText={setPlanName}
                                            />

                                            <TouchableOpacity
                                                style={{ marginLeft: 5, alignSelf: 'flex-end' }}
                                                onPress={() => setCurrentPhase("description")}
                                            >
                                                <Ionicons
                                                    name="arrow-forward"
                                                    size={18}
                                                    color="white"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                    :
                                    (
                                        <View>
                                            <TextInput
                                                placeholderTextColor="#cdd1ce"
                                                style={styles.input}
                                                placeholder="Plan Description"
                                                value={planDescription}
                                                onChangeText={setPlanDescription}
                                                multiline
                                                numberOfLines={3}
                                            />

                                            <View style={styles.buttonsView}>
                                                <TouchableOpacity
                                                    style={{ marginLeft: 5, alignSelf: 'flex-start' }}
                                                    onPress={() => setCurrentPhase("name")}
                                                >
                                                    <Ionicons
                                                        name="arrow-back"
                                                        size={18}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={{ marginRight: 5, alignSelf: 'flex-end' }}
                                                    onPress={() => setCurrentPhase("sections")}
                                                >
                                                    <Ionicons
                                                        name="arrow-forward"
                                                        size={18}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                }
                            </View>
                        )}

                        {currentPhase === "sections" && (
                            <ScrollView>
                                <Text style={{ color: '#cdd1ce', textAlign: 'center', paddingBottom: 20 }}>
                                    Now lets add some sections to your plan
                                </Text>

                                {sectionsInput.map((section, index) => (
                                    <Card key={index} style={{ backgroundColor: '#1a2938', marginBottom: 15, padding: 15 }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>{section.name}</Text>
                                        <Text style={{ color: '#cdd1ce', marginBottom: 10 }}>{section.description}</Text>
                                        {section.sources.map((source, sourceIndex) => (
                                            <Text key={sourceIndex} style={{ color: '#9aa5b1', marginBottom: 3 }}>
                                                {source.source_type}: {source.source_url}
                                            </Text>
                                        ))}
                                        <TouchableOpacity
                                            style={{ position: 'absolute', top: 5, right: 5 }}
                                            onPress={() => removeSection(index)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="red" />
                                        </TouchableOpacity>
                                    </Card>
                                ))}

                                {!isAddingSection ? (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => setIsAddingSection(true)}
                                    >
                                        <Ionicons name="add-outline" size={24} color="white" />
                                        <Text style={{ color: 'white', marginLeft: 10 }}>Add section</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={{ backgroundColor: '#1a2938', padding: 15, borderRadius: 5, marginBottom: 15 }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Add New Section</Text>
                                        <TextInput
                                            placeholderTextColor="#cdd1ce"
                                            style={styles.input}
                                            placeholder="Section Name"
                                            value={currentSection.name}
                                            onChangeText={(text) => setCurrentSection({ ...currentSection, name: text })}
                                        />
                                        <TextInput
                                            placeholderTextColor="#cdd1ce"
                                            style={styles.input}
                                            placeholder="Section Description"
                                            value={currentSection.description}
                                            onChangeText={(text) => setCurrentSection({ ...currentSection, description: text })}
                                            multiline
                                            numberOfLines={2}
                                        />

                                        <Text style={{ color: 'white', marginBottom: 5 }}>Add Source:</Text>
                                        <TextInput
                                            placeholderTextColor="#cdd1ce"
                                            style={styles.input}
                                            placeholder="Source URL"
                                            value={newSourceUrl}
                                            onChangeText={setNewSourceUrl}
                                        />
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                            <Text style={{ color: 'white', marginRight: 10 }}>Type:</Text>
                                            <TouchableOpacity
                                                style={[styles.pickerButton, newSourceType === 'Video' && styles.activePickerButton]}
                                                onPress={() => setNewSourceType('Video')}
                                            >
                                                <Ionicons
                                                    name="videocam-outline"
                                                    size={18}
                                                    color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.pickerButton, newSourceType === 'Image' && styles.activePickerButton]}
                                                onPress={() => setNewSourceType('Image')}
                                            >
                                                <Ionicons
                                                    name="camera-outline"
                                                    size={18}
                                                    color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={addSourceToCurrentSection}
                                            >
                                                <Ionicons name="add-outline" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>

                                        {currentSection.sources.map((source, index) => (
                                            <View key={index} style={styles.sourceItem}>
                                                <Text style={{ color: '#9aa5b1' }}>{source.source_type}: {source.source_url}</Text>
                                                <TouchableOpacity onPress={() => removeSourceFromCurrentSection(index)}>
                                                    <Ionicons name="close-circle-outline" size={18} color="red" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}

                                        <View style={styles.buttonsView}>
                                            <TouchableOpacity
                                                onPress={() => setIsAddingSection(false)}
                                            >
                                                <Ionicons
                                                    name="close-outline"
                                                    size={24}
                                                    color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={addSection}
                                            >
                                                <Ionicons
                                                    name="checkmark-outline"
                                                    size={24}
                                                    color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.buttonsView}>
                                    <TouchableOpacity
                                        style={{ marginLeft: 5, alignSelf: 'flex-start' }}
                                        onPress={() => setCurrentPhase("description")}
                                    >
                                        <Ionicons
                                            name="arrow-back"
                                            size={18}
                                            color="white"
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={savePlan}
                                    >
                                        <Ionicons
                                            name="save-outline"
                                            size={18}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </Card.Content>
                </Card>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    input: {
        color: 'white',
        height: 40,
        borderColor: '#cdd1ce',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
        borderRadius: 5,
    },
    buttonsView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#34495e',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    pickerButton: {
        backgroundColor: '#2c3e50',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    activePickerButton: {
        backgroundColor: '#007bff',
    },
    addSourceButton: {
        backgroundColor: '#27ae60',
        padding: 8,
        borderRadius: 5,
    },
    sourceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
        padding: 8,
        borderRadius: 5,
        marginBottom: 5,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
    },
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 5,
    },
    savePlanButton: {
        flexDirection: 'row',
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        alignSelf: 'flex-end',
    }
});
