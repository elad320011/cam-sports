import React, { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { Collapsible } from "../Collapsible";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import Dropdown from 'react-native-input-select';
import { all } from "axios";
import { Tab } from "material-ui";

type Row = {
    player: string;
    starter: string;
    position: string;
    attacks: number;
    kills: number;
    errors: number;
    killPercentage: number;
    setAttempts: number;
    assists: number;
    setErrors: number;
    digs: number;
    digErrors: number;
    digsEfficiency: number;
    serveRecieves: number;
    serveRecieveErrors: number;
    serveRecieveOne: number;
    serveRecieveTwo: number;
    serveRecieveThree: number;
    serveReciveScore: number;
    serves: number;
    aces: number;
    serveErrors: number;
    acePercentage: number;
    blocks: number;
    blockKills: number;
    blockErrors: number;
}

type GameStats = {
    id: string;
    team_id: string;
    opposite_team_name: string;
    game_date: object;
    team_sets_won_count: number;
    team_sets_lost_count: number;
    sets_scores: { [key: string]: string | number };
    team_stats: { [key: string]: any };
}

const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

export default function GameStatistics() {

    const { logout, userInfo } = useAuth();
    const [allStats, setAllStats] = useState<GameStats[] | null>(null);
    const [addMode, setAddMode] = useState(false);
    const [currentStat, setCurrentStat] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[]>([]);

    const cols = [
        "Player",
        "Starter",
        "Position",
        "Attacks",
        "Kills",
        "Errors",
        "Kill percentage",
        "Set Attempts",
        "Assists",
        "Set Errors",
        "Digs",
        "Dig Errors",
        "Digs Efficiency",
        "Serve Recieves",
        "1",
        "2",
        "3",
        "Serve Recieve Errors",
        "Serve Recieve Score",
        "Serves",
        "Aces",
        "Serve Errors",
        "Ace Percentage",
        "Blocks",
        "Block Kills",
        "Block Errors",
    ];

    const handleChange = (selectedOption: any) => {
        const selectedStat = allStats?.find(stat => stat.id === selectedOption);
        if (selectedStat) {
            setCurrentStat(selectedStat);
        }
        console.log(selectedStat?.opposite_team_name);
    }

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`http://localhost:5000/game_statistics/team_id/${userInfo?.team_id}`);
                const responseData = JSON.parse(response.data.stats)
                console.log("API Response:", response.data); // Inspect the response

                if (response.data && Array.isArray(responseData)) {
                    setAllStats(responseData);
                    setCurrentStat(null);
                } else if (response.data && responseData !== undefined && !Array.isArray(responseData)) {
                    console.error("Error: response.data.stats is not an array:", responseData);
                    setError("Failed to load game statistics: Data format is incorrect.");
                    setAllStats(null);
                    setCurrentStat(null);
                } else {
                    setAllStats([]);
                    setCurrentStat(null);
                }
            } catch (err: any) {
                console.error('Failed to fetch game statistics: ', err);
                setError('Failed to fetch game statistics: ' + err.message);
                setAllStats(null);
                setCurrentStat(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [addMode]);

    useEffect(() => {
        const newRows: Row[] = []; // Create a new empty array
        if (currentStat && currentStat.team_stats) {
            for (const playerName in currentStat.team_stats) {
                const playerStats = currentStat.team_stats[playerName];
                console.log(playerStats?.starter)

                newRows.push({
                    player: playerName,
                    starter: JSON.stringify(playerStats?.starter) || "false",
                    position: playerStats?.position || "",
                    attacks: playerStats?.attack.attempts || 0,
                    kills: playerStats?.attack.kills || 0,
                    errors: playerStats?.attack.errors || 0,
                    killPercentage: playerStats?.attack.kill_percentage || 0,
                    setAttempts: playerStats?.setting.attempts || 0,
                    assists: playerStats?.setting.assists || 0,
                    setErrors: playerStats?.setting.errors || 0,
                    digs: playerStats?.digs.attempts || 0,
                    digErrors: playerStats?.digs.errors || 0,
                    digsEfficiency: playerStats?.digs.efficiency || 0,
                    serveRecieves: playerStats?.serve_recieves.attempts || 0,
                    serveRecieveOne: playerStats?.serve_recieves.one_balls || 0,
                    serveRecieveTwo: playerStats?.serve_recieves.two_balls || 0,
                    serveRecieveThree: playerStats?.serve_recieves.three_balls || 0,
                    serveRecieveErrors: playerStats?.serve_recieves.errors || 0,
                    serveReciveScore: playerStats?.serve_recieves.efficiency || 0,
                    serves: playerStats?.serve.attempts || 0,
                    aces: playerStats?.serve.aces || 0,
                    serveErrors: playerStats?.serve.errors || 0,
                    acePercentage: playerStats?.serve.ace_percentage || 0,
                    blocks: playerStats?.blocks.attempts || 0,
                    blockKills: playerStats?.blocks.kills || 0,
                    blockErrors: playerStats?.blocks.errors || 0,
                });
            }
        }
        setRows(newRows); // Update the state with the *new* array
        console.log(newRows);
    }, [currentStat]);

    if (loading) {
        return (
            <Collapsible title="Game Statistics">
                <Text style={styles.text}>Loading game statistics...</Text>
            </Collapsible>
        );
    }

    if (error) {
        return (
            <Collapsible title="Game Statistics">
                <Text style={styles.error}>{error}</Text>
            </Collapsible>
        );
    }

    return (
        <Collapsible title="Game Statistics">
            {allStats && allStats.length > 0 ? (
                <Dropdown
                    label="Select Game"
                    selectedValue={currentStat?.id}
                    onValueChange={handleChange}
                    options={allStats.map((stats: GameStats) => ({ value: stats.id, label: `${stats.opposite_team_name} - ${formatDateToDDMMYYYY(new Date(stats?.game_date.$date))}` }))}
                    styles={styles.select}
                    primaryColor={'green'}
                    isMultiple={false}
                />
            ) : (
                <Text style={styles.text}>No game statistics available for your team.</Text>
            )}
            {currentStat && (
                <ScrollView style={styles.container}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {cols.map((col, index) => (
                                        <TableCell key={index}>{col}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length > 0 && (rows.map((row, index) => (
                                    <TableRow
                                        key={row.player}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.player}
                                        </TableCell>
                                        <TableCell align="right">{row.starter}</TableCell>
                                        <TableCell align="right">{row.position}</TableCell>
                                        <TableCell align="right">{row.attacks}</TableCell>
                                        <TableCell align="right">{row.kills}</TableCell>
                                        <TableCell align="right">{row.errors}</TableCell>
                                        <TableCell align="right">{row.killPercentage}</TableCell>
                                        <TableCell align="right">{row.setAttempts}</TableCell>
                                        <TableCell align="right">{row.assists}</TableCell>
                                        <TableCell align="right">{row.setErrors}</TableCell>
                                        <TableCell align="right">{row.digs}</TableCell>
                                        <TableCell align="right">{row.digErrors}</TableCell>
                                        <TableCell align="right">{row.digsEfficiency}</TableCell>
                                        <TableCell align="right">{row.serveRecieves}</TableCell>
                                        <TableCell align="right">{row.serveRecieveOne}</TableCell>
                                        <TableCell align="right">{row.serveRecieveTwo}</TableCell>
                                        <TableCell align="right">{row.serveRecieveThree}</TableCell>
                                        <TableCell align="right">{row.serveRecieveErrors}</TableCell>
                                        <TableCell align="right">{row.serveReciveScore}</TableCell>
                                        <TableCell align="right">{row.serves}</TableCell>
                                        <TableCell align="right">{row.aces}</TableCell>
                                        <TableCell align="right">{row.serveErrors}</TableCell>
                                        <TableCell align="right">{row.acePercentage}</TableCell>
                                        <TableCell align="right">{row.blocks}</TableCell>
                                        <TableCell align="right">{row.blockKills}</TableCell>
                                        <TableCell align="right">{row.blockErrors}</TableCell>
                                    </TableRow>
                                )))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </ScrollView>
            )}
        </Collapsible>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        textAlign: "center",
        marginVertical: 10,
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
    },
    select: {
        marginBottom: 10,
    },
    container: {
        maxHeight: 300,
    }
});
