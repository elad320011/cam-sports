import { useAuth } from '@/contexts/AuthContext';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { Button, Card } from '@rneui/themed';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import axiosInstance from '@/utils/axios';

interface ScoreRow {
    team_points: number;
    opposite_team_points: number;
}

interface Field {
    name: string;
    header: string;
}

interface Model {
    name: string;
    fields: Field[];
}

export default function SetsScores(props: any) {
    const [newTeamScore, setNewTeamScore] = useState<string>('');
    const [newOppositeTeamScore, setNewOppositeTeamScore] = useState<string>('');
    const [scores, setScores] = useState<ScoreRow[]>(props.sets);
    console.log(scores, "scores");
    const updateBackend = async () => {

        let formattedScores: { [key: string]: { team_score: number; opposite_team_score: number } } = {};
        for (let set in scores) {
            const setIndex: number = parseInt(set) + 1;
            formattedScores[setIndex.toString()] = {
                team_score: scores[set].team_points,
                opposite_team_score: scores[set].opposite_team_points
            };
        }

        console.log(formattedScores, "formattedScores");
        const payload = {
            id: props.currentStat?._id?.$oid,
            sets_scores: formattedScores
        };

        const response = await axiosInstance.put('/game_statistics/update', payload);
        if (response.status === 200) {
            console.log("Updated");
        }
    };

    const updateTeamScore = (val: any, index: number) => {
        const newScores = [...scores];
        newScores[index].team_points = parseInt(val.nativeEvent.text);
        setScores(newScores);
        updateBackend();
    };

    const updateOppositeScore = (val: any, index: number) => {
        const newScores = [...scores];
        newScores[index].opposite_team_points = parseInt(val.nativeEvent.text);
        setScores(newScores);
        updateBackend();
    };

    const handleAdd = () => {
        const newScore = {
            set: (scores.length + 1).toString(),
            team_points: parseInt(newTeamScore),
            opposite_team_points: parseInt(newOppositeTeamScore)
        };
        setScores([...scores, newScore]);
        setNewTeamScore('');
        setNewOppositeTeamScore('');
        updateBackend();
    };

    return (
        <ScrollView style={{ width: '100%', alignContent: 'center' }}>
            <div>
                {scores.map((score, index) => (
                    <Card containerStyle={styles.box} key={uuidv4()}>
                        <Card.Title>{index + 1}</Card.Title>
                        <Card.Divider />
                        <TextInput
                            style={styles.input}
                            onChange={(val) => {
                                updateTeamScore(val, index);
                            }}
                            value={scores[index].team_points.toString()}
                            placeholder='Team points'
                        />
                        <TextInput
                            style={styles.input}
                            onChange={(val) => {
                                updateOppositeScore(val, index);
                            }}
                            value={scores[index].opposite_team_points.toString()}
                            placeholder='Opposite tea points'
                        />
                    </Card>
                ))}
                <Card containerStyle={styles.box} key={uuidv4()}>
                    <Card.Title>{scores.length + 1}</Card.Title>
                    <Card.Divider />
                    <TextInput
                        style={styles.input}
                        placeholder='Team points'
                        value={newTeamScore}
                        onChange={(val) => setNewTeamScore(val.nativeEvent.text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='Opposite team points'
                        value={newOppositeTeamScore}
                        onChange={(val) => setNewOppositeTeamScore(val.nativeEvent.text)}
                    />
                    <Button
                        title="Add"
                        onPress={handleAdd}
                        style={styles.submit}
                        />
                </Card>

            </div>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    box: {
        height: 'auto',
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        width: '100%',
        marginTop: 10
    },
    submit: {
        width: '100%',
        marginTop: 20
    },
});
