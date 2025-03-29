import React, { useCallback, useState } from "react";
import { Text, StyleSheet, View, Image } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

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
};

export default function Plan(props: PlanProps) {
    const [playing, setPlaying] = useState(false);
    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
        setPlaying(false);
        }
    }, []);

    console.log(typeof(props.plan_sections))
    return (
        <View>
            <Text style={styles.plan_description}>{props.description}</Text>
            {props.plan_sections.map((item, index) => (
                <View style={styles.section} key={`section-${index}`}>
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
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        margin: 5,
        padding: 5,
        borderWidth: 1,
        borderRadius: 20,
    },
    plan_description: {
        fontSize: 22,
        textAlign: "center",
        margin: 20,
    },
    drill_name: {
        fontSize: 18,
        textAlign: "center"
    },
    drill_description: {
        margin: 20,
        fontSize: 16,
        textAlign: "center"
    },
    drill_image: {
        height: 200,
        resizeMode: "contain"
    }
});
