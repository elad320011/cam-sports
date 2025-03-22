import React, { useCallback, useState } from "react";
import { Text, StyleSheet, View, FlatList } from "react-native";
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

    const togglePlaying = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);
    return (
        <View>
            <Text style={styles.plan_description}>{props.description}</Text>
            {props.plan_sections.map((item, index) => (
                <View>
                    <Text style={styles.drill_name}>{item.name}</Text>
                    <Text style={styles.drill_description}>{item.description}</Text>

                    {item.sources.map((source, index) => (
                        <View>
                        {source.source_type === "Video" && (
                                <YoutubePlayer
                                    height={200}
                                    play={playing}
                                    videoId={source.source_url}
                                    onChangeState={onStateChange}
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
    plan_description: {
        fontSize: 22,
        textAlign: "center"
    },
    sections: {
        margin: 10,
    },
    drill_name: {
        fontSize: 18,
        textAlign: "center"
    },
    drill_description: {
        fontSize: 16,
        textAlign: "center"
    },
    video: {
        width: "100%",
        height: "100%",
        alignSelf: 'center',
      },
});
