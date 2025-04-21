import { useAuth } from '@/contexts/AuthContext';
import { Typography } from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card } from '@rneui/themed';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import axiosInstance from '@/utils/axios';

interface ScoreRow {
    id: string;
    team_points: number | null;
    opposite_team_points: number | null;
}

export default function SetsScores(props: any) {
    const [newTeamScore, setNewTeamScore] = useState<string>('');
    const [newOppositeTeamScore, setNewOppositeTeamScore] = useState<string>('');
    const [scores, setScores] = useState<ScoreRow[]>(
        props.sets.map((set: any) => ({
            id: uuidv4(),
            team_points: set.team_points !== undefined ? parseInt(set.team_points) : null,
            opposite_team_points: set.opposite_team_points !== undefined ? parseInt(set.opposite_team_points) : null,
        }))
    );


    const handleTeamScoreChange = (text: string, index: number) => {
        const newScores = scores.map((score, i) =>
            i === index ? { ...score, team_points: text ? parseInt(text) : null } : score
        );
        setScores(newScores);
    };

    const handleOppositeScoreChange = (text: string, index: number) => {
        const newScores = scores.map((score, i) =>
            i === index ? { ...score, opposite_team_points: text ? parseInt(text) : null } : score
        );
        setScores(newScores);
    };
    const updateBackend = useCallback(async (currentSetsScores: { [key: string]: { team_score: number | null; opposite_team_score: number | null } } | undefined, newScore?: ScoreRow) => {
        const payload = {
            id: props.currentStat?._id?.$oid,
            sets_scores: { ...currentSetsScores }, // Start with existing scores
        };

        if (newScore) {
            payload.sets_scores[(scores.length).toString()] = { // Use current scores length as the new key
                team_score: newScore.team_points,
                opposite_team_score: newScore.opposite_team_points,
            };
        } else {
            // Update existing sets based on the 'scores' state
            scores.forEach((score, index) => {
                const setIndex = index + 1;
                payload.sets_scores[setIndex.toString()] = {
                    team_score: score.team_points,
                    opposite_team_score: score.opposite_team_points,
                };
            });
        }

        try {
            const response = await axiosInstance.put('/game_statistics/update', payload);
            if (response.status === 200) {
                console.log("Sets scores updated");
            }
        } catch (error) {
            console.error("Error updating sets scores:", error);
        }
    }, [props.currentStat?._id?.$oid, scores]);

    const handleAdd = async () => {
        if (scores.length < 5) {
            const newScore: ScoreRow = {
                id: uuidv4(),
                team_points: newTeamScore ? parseInt(newTeamScore) : null,
                opposite_team_points: newOppositeTeamScore ? parseInt(newOppositeTeamScore) : null,
            };
            setScores([...scores, newScore]);
            setNewTeamScore('');
            setNewOppositeTeamScore('');

            // Fetch existing scores and then update with the new one
            handleSaveSet(newScore);

        } else {
            console.warn("Maximum number of sets (5) reached.");
        }
    };

    const handleSaveSet = async (score: ScoreRow) => {
        // When saving an existing set, we need to update all scores
        try {
            const response = await axiosInstance.get(`/game_statistics/game_id/${props.currentStat?._id?.$oid}`);
            if (response.status === 200 && response.data?.sets_scores) {
                await updateBackend(response.data.sets_scores);
            } else {
                await updateBackend({});
            }
        } catch (error) {
            console.error("Error fetching existing sets scores for save:", error);
        }
    };

    return (
        <ScrollView style={{ width: '100%', alignContent: 'center' }}>
            <View>
                {scores.map((score, index) => (
                    <Card containerStyle={styles.box} key={score.id}>
                        <Card.Title>{index + 1}</Card.Title>
                        <Card.Divider />
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Team Score"
                                keyboardType="number-pad"
                                value={score.team_points !== null ? score.team_points.toString() : ''}
                                onChangeText={(text) => handleTeamScoreChange(text, index)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Opponent Score"
                                keyboardType="number-pad"
                                value={score.opposite_team_points !== null ? score.opposite_team_points.toString() : ''}
                                onChangeText={(text) => handleOppositeScoreChange(text, index)}
                            />
                        </View>
                        <Button
                            title="Save"
                            onPress={() => handleSaveSet(score)}
                            style={styles.saveButton}
                        />
                    </Card>
                ))}
                <Card containerStyle={styles.box} key="add_new_set">
                    <Card.Title>{scores.length + 1}</Card.Title>
                    <Card.Divider />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Team Score"
                            keyboardType="number-pad"
                            value={newTeamScore}
                            onChangeText={setNewTeamScore}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Opponent Score"
                            keyboardType="number-pad"
                            value={newOppositeTeamScore}
                            onChangeText={setNewOppositeTeamScore}
                        />
                    </View>
                    <Button
                        title="Add Set"
                        onPress={handleAdd}
                        style={styles.submit}
                    />
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    box: {
        height: 'auto',
        backgroundColor: 'white',
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        width: '48%',
        marginTop: 10,
        borderRadius: 5,
    },
    submit: {
        width: '100%',
        marginTop: 20,
    },
    saveButton: {
        width: '100%',
        marginTop: 10,
    },
});
