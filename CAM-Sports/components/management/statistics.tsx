import React, { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { Collapsible } from "../Collapsible";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, Typography, ButtonGroup, Button } from "@mui/material";
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import Dropdown from 'react-native-input-select';
import EditStat from "./gameStatisticsComponents/EditStat";
import AddStat from "./gameStatisticsComponents/AddStat";

type Score = {
    team_score: number;
    opposite_team_score: number;
}

export type GameStats = {
    _id: any;
    team_id: string;
    opposite_team_name: string;
    game_date: object;
    team_sets_won_count: number;
    team_sets_lost_count: number;
    sets_scores: { [key: string]: Score };
    team_stats: { [key: string]: any };
}

const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const offenseCols = [
    "Player",
    "Starter",
    "Position",
    "Attacks",
    "Kills",
    "Errors",
    "Kill percentage",
    "Serves",
    "Aces",
    "Serve Errors",
    "Ace Percentage",
];

const settingCols = [
    "Player",
    "Starter",
    "Position",
    "Set Attempts",
    "Assists",
    "Set Errors",
]

const defenseCols = [
    "Player",
    "Starter",
    "Position",
    "Digs",
    "Dig Errors",
    "Digs Efficiency",
    "Serve Recieves",
    "1",
    "2",
    "3",
    "Serve Recieve Errors",
    "Serve Recieve Score",
    "Blocks",
    "Block Kills",
    "Block Errors",
]

const allCols = [
    "id",
    "Player",
    "Starter",
    "Position",
    "Attacks",
    "Kills",
    "Errors",
    "Kill percentage",
    "Serves",
    "Aces",
    "Serve Errors",
    "Ace Percentage",
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
    "Blocks",
    "Block Kills",
    "Block Errors",
]

export type Row = {
    player: string;
    starter: string;
    position: string;
    attacks?: number;
    kills?: number;
    errors?: number;
    killPercentage?: number;
    serves?: number;
    aces?: number;
    serveErrors?: number;
    acePercentage?: number;
    setAttempts?: number;
    assists?: number;
    setErrors?: number;
    digs?: number;
    digErrors?: number;
    digsEfficiency?: number;
    serveRecieves?: number;
    serveRecieveOne?: number;
    serveRecieveTwo?: number;
    serveRecieveThree?: number;
    serveRecieveErrors?: number;
    serveReciveScore?: number;
    blocks?: number;
    blockKills?: number;
    blockErrors?: number;
};

export default function GameStatistics() {

    const { logout, user } = useAuth();
    const [allStats, setAllStats] = useState<GameStats[] | null>(null);
    const [currentMode, setCurrentMode] = useState("View");
    const [currentStat, setCurrentStat] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[]>([]);
    const [cols, setCols] = useState<string[]>(allCols);
    const [currentStatus, setCurrentStatus] = useState<string>();

    const handleChange = (selectedOption: any) => {
        const selectedStat = allStats?.find(stat => stat._id === selectedOption);
        if (selectedStat) {
            setCurrentStat(selectedStat);
        }
    }

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`/game_statistics/team_id/${userInfo?.team_id}`);
                const responseData = JSON.parse(response.data.stats)

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
    }, [currentMode]);

    useEffect(() => {
        const newRows = []; // Create a new empty array
        if (currentStat && currentStat.team_stats) {

            currentStat.team_sets_won_count > currentStat.team_sets_lost_count ? setCurrentStatus("W") : setCurrentStatus("L");

            for (const playerName in currentStat.team_stats) {
                const playerStats = currentStat.team_stats[playerName];

                if (cols == offenseCols) {
                    newRows.push({
                        player: playerName,
                        starter: JSON.stringify(playerStats?.starter) || "false",
                        position: playerStats?.position || "",
                        attacks: playerStats?.attack.attempts || 0,
                        kills: playerStats?.attack.kills || 0,
                        errors: playerStats?.attack.errors || 0,
                        killPercentage: playerStats?.attack.kill_percentage || 0,
                        serves: playerStats?.serve.attempts || 0,
                        aces: playerStats?.serve.aces || 0,
                        serveErrors: playerStats?.serve.errors || 0,
                        acePercentage: playerStats?.serve.ace_percentage || 0,
                    });
                }
                else if (cols == settingCols) {
                    newRows.push({
                        player: playerName,
                        starter: JSON.stringify(playerStats?.starter) || "false",
                        position: playerStats?.position || "",
                        setAttempts: playerStats?.setting.attempts || 0,
                        assists: playerStats?.setting.assists || 0,
                        setErrors: playerStats?.setting.errors || 0,
                    });
                }
                else if (cols == defenseCols) {
                    newRows.push({
                        player: playerName,
                        starter: JSON.stringify(playerStats?.starter) || "false",
                        position: playerStats?.position || "",
                        digs: playerStats?.digs.attempts || 0,
                        digErrors: playerStats?.digs.errors || 0,
                        digsEfficiency: playerStats?.digs.efficiency || 0,
                        serveRecieves: playerStats?.serve_recieves.attempts || 0,
                        serveRecieveOne: playerStats?.serve_recieves.one_balls || 0,
                        serveRecieveTwo: playerStats?.serve_recieves.two_balls || 0,
                        serveRecieveThree: playerStats?.serve_recieves.three_balls || 0,
                        serveRecieveErrors: playerStats?.serve_recieves.errors || 0,
                        serveReciveScore: playerStats?.serve_recieves.efficiency || 0,
                        blocks: playerStats?.blocks.attempts || 0,
                        blockKills: playerStats?.blocks.kills || 0,
                        blockErrors: playerStats?.blocks.errors || 0,
                    });
                }
                else {
                    newRows.push({
                        player: playerName,
                        starter: JSON.stringify(playerStats?.starter) || "false",
                        position: playerStats?.position || "",
                        attacks: playerStats?.attack.attempts || 0,
                        kills: playerStats?.attack.kills || 0,
                        errors: playerStats?.attack.errors || 0,
                        killPercentage: playerStats?.attack.kill_percentage || 0,
                        serves: playerStats?.serve.attempts || 0,
                        aces: playerStats?.serve.aces || 0,
                        serveErrors: playerStats?.serve.errors || 0,
                        acePercentage: playerStats?.serve.ace_percentage || 0,
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
                        blocks: playerStats?.blocks.attempts || 0,
                        blockKills: playerStats?.blocks.kills || 0,
                        blockErrors: playerStats?.blocks.errors || 0,
                    })
                }
            }
        }
        setRows(newRows); // Update the state with the *new* array
        }, [currentStat, cols]);

    const showSets = () => {
        const setsSection = document.getElementById("setsSection");
        const playerStatsSection = document.getElementById("playerStatsSection");
        if (setsSection) {
            setsSection.style.display = "inline";
        }
        if (playerStatsSection) {
            playerStatsSection.style.display = "none";
        }
    }

    const showPlayerStats = () => {
        const setsSection = document.getElementById("setsSection");
        const playerStatsSection = document.getElementById("playerStatsSection");
        if (setsSection) {
            setsSection.style.display = "none";
        }
        if (playerStatsSection) {
            playerStatsSection.style.display = "inline";
        }
    }

    const showOffense = () => {
        setCols(offenseCols);
    }

    const showSetting = () => {
        setCols(settingCols);
    }

    const showDefense = () => {
        setCols(defenseCols);
    }

    const showAll = () => {
        setCols(allCols);
    }

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

    const turnAddMode = () => {
        setCurrentMode("Add");
    }

    const turnEditMode = () => {
        setCurrentMode("Edit");
    }

    const turnViewMode = () => {
        setCurrentMode("View");
    }

    return (
        <Collapsible title="Game Statistics">
            {allStats && allStats.length > 0 ? (
                <div>
                    <ButtonGroup variant="text" style={styles.menu} aria-label="Basic button group">
                        <Button onClick={turnAddMode}>Add</Button>
                        <Button onClick={turnEditMode}>Edit</Button>
                        <Button onClick={turnViewMode}>View</Button>
                    </ButtonGroup>

                    {currentMode != "Add" && (
                        <Dropdown
                            label="Select Game"
                            selectedValue={currentStat?._id}
                            onValueChange={handleChange}
                            options={allStats.map((stats: GameStats) => ({ value: stats._id, label: `${stats.opposite_team_name} - ${formatDateToDDMMYYYY(new Date(stats?.game_date.$date))} (${stats?.team_sets_won_count > stats?.team_sets_lost_count ? "W" : "L"})` }))}
                            styles={styles.select}
                            primaryColor={'green'}
                            isMultiple={false}
                        />
                    )}
                </div>
            ) : (
                <div>
                    <Text style={styles.text}>No game statistics available for your team.</Text>
                    <Button onClick={turnAddMode} style={styles.menu}>Create a game statistic</Button>
                </div>
            )}
            {currentStat && (
                <div>
                    {currentMode == "Edit" && (
                        <div>
                            <EditStat setCurrentMode={setCurrentMode} currentStat={currentStat} initialRows={rows}/>
                        </div>
                    )}
                    {currentMode == "View" && (
                        <div>
                            <ButtonGroup variant="text" style={styles.menu} aria-label="Basic button group">
                                <Button onClick={showSets}>Sets</Button>
                                <Button onClick={showPlayerStats}>Player Stats</Button>
                            </ButtonGroup>
                            <Card style={styles.section} id="setsSection">
                                <Typography variant="h5" style={styles.setScoreHeader}>Set Scores:</Typography>
                                <ScrollView style={styles.container}>
                                    {Object.keys(currentStat.sets_scores).map((key, index) => (
                                        <Card style={styles.setScore} key={index}>
                                            <Typography variant="h6">Set {index + 1}</Typography>
                                            <Typography style={styles.scoreLine}>Points: {currentStat.sets_scores[key].team_score}</Typography>
                                            <Typography style={styles.scoreLine}>Opponent Points: {currentStat.sets_scores[key].opposite_team_score}</Typography>
                                        </Card>
                                    ))}
                                </ScrollView>
                            </Card>

                            <Card style={styles.section} id="playerStatsSection">
                                <Typography variant="h5">Stats</Typography>
                                <ScrollView style={styles.container}>
                                    <ButtonGroup style={styles.playerStatsMenu}>
                                        <Button onClick={showOffense}>Offense</Button>
                                        <Button onClick={showSetting}>Setting</Button>
                                        <Button onClick={showDefense}>Defense</Button>
                                        <Button onClick={showAll}>All</Button>
                                    </ButtonGroup>
                                    <TableContainer component={Paper} id="offense">
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
                                                        {Object.keys(row).map((key, index) => (
                                                            <TableCell align="center" key={index}>{row[key as keyof Row]}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                )))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </ScrollView>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {currentMode == "Add" && (
                <AddStat setCurrentMode={setCurrentMode} />
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
    },
    menu: {
        justifyContent: "center",
        width: "100%",
    },
    section: {
        margin: 'auto',
        marginBottom: 30,
        display: 'none',
    },
    playerStatsMenu: {
        margin: 10,
    },
    scoreLine: {
        fontSize: 12,
    },
    setScore: {
        padding: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    setScoreHeader: {
        padding: 20,
        width: "90%",
        alignSelf: "center",
        margin: 'auto',
        marginTop: 10,
    }
});
