import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Card, Divider, Button } from "react-native-paper";
import ImageView from "react-native-image-viewing";
import { sources } from "./assets";
import { VideoGallery } from "./VideoGallery";
import axiosInstance from '@/utils/axios';
import Modal from 'react-native-modal';
import { ButtonGroup } from "react-native-elements";
import Ionicons from "@expo/vector-icons/Ionicons";

export function DisplayPlan(props: any) {

    const [images, setImages] = useState<{ uri: string }[]>([]);
    const [videos, setVideos] = useState<{ uri: string }[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [visible, setIsVisible] = useState(false);
    const [videoVisible, setVideoVisible] = useState(false);
    const plan = props.plan;
    const setCurrentPlan = props.setCurrentPlan;

    const deletePlan = async () => {
        const response = await axiosInstance.delete(`/training_plans/delete`,
            {
                data: {
                    plan_id: plan.id,
                    team_id: plan.team_id
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            },
        );
        if (response.status === 200) {
            setCurrentPlan(undefined);
        } else {
            console.error("Failed to delete plan", response.data);
        }
    }

    const toggleSectionNext = () => {
        if (currentSectionIndex < plan.plan_sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        } else {
            setCurrentSectionIndex(0);
        }
    }

    const toggleSectionPrevious = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        } else {
            setCurrentSectionIndex(plan.plan_sections.length - 1);
        }
    }

    return (
        <Modal
            isVisible={plan !== undefined}
            animationIn="bounceInUp"
            hasBackdrop={true}
            onBackdropPress={() => setCurrentPlan(undefined)}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Card style={{ backgroundColor: '#0c1c2c', width: '80%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, marginTop: 10, marginLeft: 10 }}>
                        <TouchableOpacity
                            onPress={()=> deletePlan()}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={24}
                                color="#e88e61"
                            />
                        </TouchableOpacity>
                    </View>
                    <Card.Title
                        title={`${plan.name}`}
                        subtitle={plan.description}
                        titleStyle={{ fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}
                        subtitleStyle={{ fontSize: 16, color: '#cdd1ce', textAlign: 'center' }}
                    />
                    <Divider style={{ margin: 20 }}/>
                    <Card.Content>
                        <View>
                            <Text style={{ marginBottom: 10, color: '#cdd1ce', textAlign: 'center' }}>
                                {`${plan.plan_sections[currentSectionIndex].name}: ${plan.plan_sections[currentSectionIndex].description}`}
                            </Text>
                            {plan.plan_sections[currentSectionIndex].sources.filter((obj: sources) => obj.source_type === "Image").length > 0 && (
                                <Button
                                    textColor="#cdd1ce"
                                    onPress={() => {
                                        setImages(plan.plan_sections[currentSectionIndex].sources.filter((obj: sources) => obj.source_type === "Image").map((image: any) => ({uri: image.source_url})));
                                        setIsVisible(true)
                                    }}
                                >Images</Button>
                            )}
                            {plan.plan_sections[currentSectionIndex].sources.filter((obj: sources) => obj.source_type === "Video").length > 0 && (
                                <Button
                                    textColor="#cdd1ce"
                                    onPress={() => {
                                        setVideos(plan.plan_sections[currentSectionIndex].sources.filter((obj: sources) => obj.source_type === "Video").map((video: any) => ({uri: video.source_url})));
                                        setVideoVisible(true)
                                    }}
                                >Videos</Button>
                            )}
                        </View>

                    <Divider style={{ margin: 20 }} />

                    <ButtonGroup
                        buttons={["<", ">"]}
                        onPress={(index) => {
                            if (index == 0) {
                                toggleSectionPrevious()
                            }
                            else {
                                toggleSectionNext();
                            }
                        }}
                        containerStyle={{ marginBottom: 20, backgroundColor: 'transparent', borderColor: 'transparent' }}
                        textStyle={{ color: '#cdd1ce', fontWeight: 'bold' }}
                    />
                    {/* <Button mode="outlined" onPress={() => deletePlan()} style={{ marginTop: 10, marginBottom: 10, borderColor: '#faec93' }} textColor="#cdd1ce">Delete</Button> */}
                    </Card.Content>
                    <ImageView
                        images={images}
                        imageIndex={0}
                        visible={visible}
                        onRequestClose={() => setIsVisible(false)}
                    />
                </Card>
            </View>
            {videoVisible && (
                <VideoGallery videos={videos} videoVisible={videoVisible} setVideoVisible={setVideoVisible} />
            )}
        </Modal>
    );
}
