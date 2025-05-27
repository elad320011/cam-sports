import { useCallback, useState } from "react";
import { Text, Button, View, Alert } from "react-native";
import Modal from 'react-native-modal';
import { ButtonGroup } from "react-native-elements";
import { Card, Divider } from "react-native-paper"
import YoutubePlayer from "react-native-youtube-iframe";

export function VideoGallery(props: any) {
    const { videos, videoVisible, setVideoVisible } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

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

      console.log(currentIndex)

    return (
        <>
            <Modal
                isVisible={videoVisible}
                animationIn="bounceInUp"
                hasBackdrop={true}
                onBackdropPress={() => setVideoVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <Card style={{ backgroundColor: '#f5f5f5', width: '80%' }}>
                        <Card.Content>
                            <YoutubePlayer
                                height={180}
                                play={playing}
                                videoId={videos[currentIndex].uri.split('v=')[1].split("&")[0]}
                                onChangeState={onStateChange}
                            />

                            <Divider style={{ margin: 20 }} />

                            <ButtonGroup
                                buttons={["<", ">"]}
                                onPress={(index) => {
                                    if (index == 0) {
                                        backButton()
                                    }
                                    else {
                                        forwardButton()
                                    }
                                }}
                                containerStyle={{ marginBottom: 20 }}
                            />
                        </Card.Content>
                    </Card>
                </View>
            </Modal>
        </>
    );
}
