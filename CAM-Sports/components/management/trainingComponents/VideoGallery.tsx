import React, { useCallback, useState } from "react";
import { Text, Button, View, Alert } from "react-native";
import Modal from 'react-native-modal';
import { ButtonGroupWrapper } from '../../ButtonGroupWrapper';
import { Card, Divider } from "react-native-paper"
import YoutubePlayer from "react-native-youtube-iframe";

type VideoGalleryProps = {
    videos: { uri: string }[];
    videoVisible: boolean;
    setVideoVisible: (visible: boolean) => void;
};

export function VideoGallery(props: VideoGalleryProps) {
    const { videos, videoVisible, setVideoVisible } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playing, setPlaying] = useState(true);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
          setPlaying(false);
        }
      }, []);

      const togglePlaying = useCallback(() => {
        setPlaying((prev) => !prev);
      }, []);

      const backButton = () => {
        if (currentIndex == 0) {
            setCurrentIndex(videos.length - 1);
        }
        else {
            setCurrentIndex(currentIndex - 1)
        }
      }

      const forwardButton = () => {
        if (currentIndex == videos.length - 1) {
            setCurrentIndex(0);
        }
        else {
            setCurrentIndex(currentIndex + 1)
        }
      }

    return (
        <>
            <Modal
                isVisible={videoVisible}
                animationIn="bounceInUp"
                hasBackdrop={true}
                onBackdropPress={() => setVideoVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <Card style={{ backgroundColor: '#0c1c2c', width: '80%' }}>
                        <Card.Content>
                            <YoutubePlayer
                                height={180}
                                play={playing}
                                videoId={videos[currentIndex].uri.split('v=')[1].split("&")[0]}
                                onChangeState={onStateChange}

                            />

                            <Divider style={{ margin: 20 }} />

                            <ButtonGroupWrapper
                                buttons={["<", playing ? "pause" : "play", ">"]}
                                onPress={(index) => {
                                    if (index == 0) {
                                        backButton()
                                    }
                                    else if (index == 2) {
                                        forwardButton()
                                    }
                                    else {
                                        togglePlaying();
                                    }
                                }}
                                containerStyle={{ marginBottom: 20, backgroundColor: 'transparent', borderColor: 'transparent' }}
                                textStyle={{ color: '#cdd1ce', fontWeight: 'bold' }}
                            />
                        </Card.Content>
                    </Card>
                </View>
            </Modal>
        </>
    );
}
