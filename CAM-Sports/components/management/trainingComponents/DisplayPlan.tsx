import { useState } from "react";
import { Text, ScrollView, View } from "react-native";
import { Card, Divider, Button } from "react-native-paper";
import ImageView from "react-native-image-viewing";
import { sources } from "./assets";
import { VideoGallery } from "./VideoGallery";
import axiosInstance from '@/utils/axios';

export function DisplayPlan(props: any) {

    const [images, setImages] = useState<{ uri: string }[]>([]);
    const [videos, setVideos] = useState<{ uri: string }[]>([]);
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

    return (
        <>
            <ScrollView style={{ flex: 1, padding: 10, width: '100%', height: '100%' }}>
                <Card style={{ marginBottom: 10, backgroundColor: '#f5f5f5' }}>
                    <Card.Title
                        title={`${plan.name}`}
                        subtitle={plan.description}
                    />
                    <Divider style={{ margin: 20 }}/>
                    <Card.Content>
                        {plan.plan_sections.map((section: any, index: number) => (
                            <View key={index}>
                                <Text key={index} style={{ marginBottom: 10 }}>
                                    {`${section.name}: ${section.description}`}
                                </Text>
                                {section.sources.filter((obj: sources) => obj.source_type === "Image").length > 0 && (
                                    <Button onPress={() => {
                                        setImages(section.sources.filter((obj: sources) => obj.source_type === "Image").map((image: any) => ({uri: image.source_url})));
                                        setIsVisible(true)
                                    }}>Images</Button>
                                )}
                                {section.sources.filter((obj: sources) => obj.source_type === "Video").length > 0 && (
                                    <Button onPress={() => {
                                        setVideos(section.sources.filter((obj: sources) => obj.source_type === "Video").map((video: any) => ({uri: video.source_url})));
                                        setVideoVisible(true)
                                    }}>Videos</Button>
                                )}
                                <Divider style={{ margin: 20 }}/>
                            </View>
                        ))}
                    <Button mode="contained" onPress={() => deletePlan()} style={{ marginTop: 10, marginBottom: 10, backgroundColor: '#f06270' }}>Delete</Button>
                    </Card.Content>
                    <ImageView
                        images={images}
                        imageIndex={0}
                        visible={visible}
                        onRequestClose={() => setIsVisible(false)}
                    />
                </Card>
            </ScrollView>
            {videoVisible && (
                <VideoGallery videos={videos} videoVisible={videoVisible} setVideoVisible={setVideoVisible} />
            )}
        </>
    );
}
