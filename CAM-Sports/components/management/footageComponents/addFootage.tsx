import Modal from "react-native-modal";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import { Card, Divider, TextInput } from "react-native-paper";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import axiosInstance from '@/utils/axios';

type AddFootageProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    teamId: string | undefined;
    userId: string | undefined;
};

export function AddFootage(props: AddFootageProps) {

    const { visible, setVisible, teamId, userId } = props;
    const [currentPhase, setCurrentPhase] = useState('Title');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTagInput, setCurrentTagInput] = useState('');

    const handleAddTag = () => {
        const trimmedTag = currentTagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setCurrentTagInput('');
        } else if (trimmedTag && tags.includes(trimmedTag)) {
            console.log("Tag already exists!");
            setCurrentTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: any) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const saveFootage = async () => {
        const response = await axiosInstance.post('/footage/create', {
            title: title,
            url: url,
            tags: tags,
            team_id: teamId,
            user_id: userId,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data.footage_id) {
            setVisible(false);
            setCurrentPhase('Title');
            setTitle('');
            setUrl('');
            setTags([]);
            setCurrentTagInput('');

            Alert.alert(
                "Success",
                "Footage saved successfully!",
                [{ text: "OK" }]
            );
        }
        else {
            Alert.alert(
                "Error",
                "Failed to save footage. Please try again.",
                [{ text: "OK" }]
            )
        }
    }

    return (
        <Modal
            isVisible={visible}
            animationIn="bounceInUp"
            hasBackdrop={true}
            onBackdropPress={() => {
                setVisible(false);
                setCurrentPhase('Title');
            }}
        >
            <View style={styles.modalContentContainer}>
                <Card style={styles.card}>
                    <Card.Title
                        title="Add Footage"
                        subtitle="Share with visuals your team"
                        subtitleStyle={styles.subtitleStyle}
                        style={styles.cardTitleContainer}
                        titleStyle={styles.titleStyle}
                    />
                    <Divider style={styles.divider} />
                    <Card.Content>
                        <View>
                            {currentPhase === 'Title' && (
                                <View>
                                    <TextInput
                                        placeholderTextColor="#cdd1ce"
                                        style={styles.input}
                                        textColor="white"
                                        placeholder="Title"
                                        value={title}
                                        onChangeText={setTitle}
                                    />

                                    <TouchableOpacity
                                        style={styles.nextButton}
                                        onPress={() => setCurrentPhase("Url")}
                                    >
                                        <Ionicons
                                            name="arrow-forward"
                                            size={18}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {currentPhase === 'Url' && (
                                <View>
                                    <TextInput
                                        placeholderTextColor="#cdd1ce"
                                        style={styles.input}
                                        textColor="white"
                                        placeholder="Video URL"
                                        value={url}
                                        onChangeText={setUrl}
                                    />

                                    <View style={styles.buttonsView}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setCurrentPhase("Title")}
                                        >
                                            <Ionicons
                                                name="arrow-back"
                                                size={18}
                                                color="white"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.nextButton}
                                            onPress={() => setCurrentPhase("Tags")}
                                        >
                                            <Ionicons
                                                name="arrow-forward"
                                                size={18}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            {currentPhase === 'Tags' && (
                                <View>
                                    <TextInput
                                        placeholderTextColor="#cdd1ce"
                                        style={styles.input}
                                        textColor="white"
                                        placeholder="Add Tags (press Enter)"
                                        value={currentTagInput}
                                        onChangeText={setCurrentTagInput}
                                        onSubmitEditing={handleAddTag}
                                        returnKeyType="done"
                                    />

                                    {tags.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.tagsContainer}
                                        >
                                            {tags.map((tag, index) => (
                                                <View key={index} style={styles.tagChip}>
                                                    <Text style={styles.tagText}>{tag}</Text>
                                                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.removeTagButton}>
                                                        <Ionicons name="close-circle" size={16} color="#cdd1ce" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    )}

                                    <View style={styles.buttonsView}>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setCurrentPhase("Url")}
                                        >
                                            <Ionicons
                                                name="arrow-back"
                                                size={18}
                                                color="white"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={() => {
                                                saveFootage();
                                            }}
                                        >
                                            <Ionicons
                                                name="save-outline"
                                                size={18}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Card.Content>
                </Card>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    card: {
        backgroundColor: '#0c1c2c',
        width: '80%',
        borderRadius: 10,
        paddingBottom: 10,
    },
    cardTitleContainer: {
        margin: 10,
    },
    titleStyle: {
        color: '#fff',
        fontSize: 24,
        alignSelf: 'center',
    },
    subtitleStyle: {
        color: 'lightgray',
        fontSize: 14,
        alignSelf: 'center',
    },
    divider: {
        backgroundColor: '#fff',
        marginVertical: 10,
    },
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
    nextButton: {
        marginLeft: 5,
        alignSelf: 'flex-end',
    },
    backButton: {
        marginLeft: 5,
        alignSelf: 'flex-start',
    },
    saveButton: {
        marginRight: 5,
        alignSelf: 'flex-end',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 10,
        maxHeight: 80,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#334455',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: 'white',
        fontSize: 14,
        marginRight: 5,
    },
    removeTagButton: {
        marginLeft: 5,
    },
});
