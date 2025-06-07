import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Card, Divider, Button } from "react-native-paper";
import ImageView from "react-native-image-viewing";
import { PlanProps, sources } from "./assets";
import { VideoGallery } from "./VideoGallery";
import axiosInstance from '@/utils/axios';
import Modal from 'react-native-modal';
import { ButtonGroupWrapper } from '../../ButtonGroupWrapper';
import Ionicons from "@expo/vector-icons/Ionicons";

type DisplayPlanProps = {
    plan: PlanProps;
    setCurrentPlan: React.Dispatch<React.SetStateAction<PlanProps | undefined>>;
};

export function DisplayPlan(props: DisplayPlanProps) {

    const [images, setImages] = useState<{ uri: string }[]>([]);
    const [videos, setVideos] = useState<{ uri: string }[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [visible, setIsVisible] = useState(false);
    const [videoVisible, setVideoVisible] = useState(false);
    const plan = props.plan;
    const setCurrentPlan = props.setCurrentPlan;

    // Add a check for plan.plan_sections existence and if it's not empty
    const currentSection = plan.plan_sections && plan.plan_sections.length > 0
        ? plan.plan_sections[currentSectionIndex]
        : undefined;

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
        if (plan.plan_sections && plan.plan_sections.length > 0) {
            if (currentSectionIndex < plan.plan_sections.length - 1) {
                setCurrentSectionIndex(currentSectionIndex + 1);
            } else {
                setCurrentSectionIndex(0);
            }
        }
    }

    const toggleSectionPrevious = () => {
        if (plan.plan_sections && plan.plan_sections.length > 0) {
            if (currentSectionIndex > 0) {
                setCurrentSectionIndex(currentSectionIndex - 1);
            } else {
                setCurrentSectionIndex(plan.plan_sections.length - 1);
            }
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
                            {currentSection ? (
                                <Text style={{ marginBottom: 10, color: '#cdd1ce', textAlign: 'center' }}>
                                    {`${currentSection.name}: ${currentSection.description}`}
                                </Text>
                            ) : (
                                <Text style={{ marginBottom: 10, color: '#cdd1ce', textAlign: 'center' }}>
                                    No sections or drills available for {plan.name}.
                                </Text>
                            )}
                            {/* Use currentSection for checks */}
                            {currentSection && currentSection.sources && currentSection.sources.filter((obj: sources) => obj.source_type === "Image").length > 0 && (
                                <Button
                                    textColor="#cdd1ce"
                                    onPress={() => {
                                        setImages(currentSection.sources.filter((obj: sources) => obj.source_type === "Image").map((image: any) => ({uri: image.source_url})));
                                        setIsVisible(true)
                                    }}
                                >Images</Button>
                            )}
                            {currentSection && currentSection.sources && currentSection.sources.filter((obj: sources) => obj.source_type === "Video").length > 0 && (
                                <Button
                                    textColor="#cdd1ce"
                                    onPress={() => {
                                        setVideos(currentSection.sources.filter((obj: sources) => obj.source_type === "Video").map((video: any) => ({uri: video.source_url})));
                                        setVideoVisible(true)
                                    }}
                                >Videos</Button>
                            )}
                        </View>

                    <Divider style={{ margin: 20 }} />

                    {/* Only show buttons if there are sections */}
                    {plan.plan_sections && plan.plan_sections.length > 0 && (
                        <ButtonGroupWrapper
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
                    )}
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
