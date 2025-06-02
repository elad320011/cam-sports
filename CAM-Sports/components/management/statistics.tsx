import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Button, TouchableOpacity, Image } from "react-native";
import { Collapsible } from "../Collapsible";
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import Dropdown from 'react-native-input-select';
import AddStat from "./gameStatisticsComponents/AddStat";
import { ButtonGroup } from '@rneui/themed';
import ViewStat from "./gameStatisticsComponents/ViewStat";
import { GameStats, DataRow, allCols, formatDateToDDMMYYYY, offenseCols } from "./gameStatisticsComponents/assets";
import { Ionicons } from "@expo/vector-icons";

export default function GameStatistics() {

    const { logout, user } = useAuth();
    const [allStats, setAllStats] = useState<GameStats[] | null>(null);
    const [currentMode, setCurrentMode] = useState("View");
    const [currentStat, setCurrentStat] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<DataRow[]>([]);
    const [cols, setCols] = useState<string[]>(allCols);
    const [page, setPage] = React.useState<number>(0);
    const [editSet, setEditSet] = useState<string>("");
    const [numberOfItemsPerPageList] = React.useState([5, 8, 10]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    );

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, rows.length);

    React.useEffect(() => {
      setPage(0);
    }, [itemsPerPage]);


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
                const response = await axiosInstance.get(`/game_statistics/team_id/${user?.team_id}`);
                const responseData = JSON.parse(response.data.stats)

                if (response.data && Array.isArray(responseData)) {
                    setAllStats(responseData);

                } else if (response.data && responseData !== undefined && !Array.isArray(responseData)) {
                    console.error("Error: response.data.stats is not an array:", responseData);
                    setError("Failed to load game statistics: Data format is incorrect.");
                    setAllStats(null);

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
    }, [currentMode, rows, editSet]);

    useEffect(() => {
        const newRows = []; // Create a new empty array
        if (currentStat && currentStat.team_stats) {

            for (const playerName in currentStat.team_stats) {
                const playerStats = currentStat.team_stats[playerName];

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
        setRows(newRows); // Update the state with the *new* array
    }, [currentStat, cols]);

    useEffect(() => {
        // Update backend

    }, [rows]);

    if (loading) {
        return (
            <Collapsible 
                title="Game Statistics"
                image={require('@/assets/images/statistics.png')}
                imageStyle={styles.image}
                titleContainerStyle={styles.imageWrapper}
            >
                <Text style={styles.text}>Loading game statistics...</Text>
            </Collapsible>
        );
    }

    if (error) {
        return (
            <Collapsible 
                title="Game Statistics"
                image={require('@/assets/images/statistics.png')}
                imageStyle={styles.image}
                titleContainerStyle={styles.imageWrapper}
            >
                <Text style={styles.error}>{error}</Text>
            </Collapsible>
        );
    }

    return (
        <Collapsible 
            title="Game Statistics"
            image={require('@/assets/images/statistics.png')}
            imageStyle={styles.image}
            titleContainerStyle={styles.imageWrapper}
        >
            {allStats && allStats.length > 0 ? (
                <>

                    {currentMode != "Add" && (
                        <Dropdown
                            label="Select Game"
                            selectedValue={currentStat?._id}
                            onValueChange={handleChange}
                            options={allStats.map((stats: GameStats) => ({ value: stats._id, label: `${stats.opposite_team_name} - ${formatDateToDDMMYYYY(new Date(stats.game_date.$date))} (${stats.team_sets_won_count > stats.team_sets_lost_count ? "W" : "L"})` }))}
                            primaryColor={'green'}
                            isMultiple={false}
                        />
                    )}
                </>
            ) : (
                <>
                    <Text style={styles.text}>No game statistics available for your team.</Text>
                </>
            )}
            {currentStat && (
                <>
                    {currentMode == "View" && (
                        <ViewStat
                            currentStat={currentStat}
                            setCurrentStat={setCurrentStat}
                            rows={rows}
                            cols={cols}
                            from={from}
                            to={to}
                            itemsPerPage={itemsPerPage}
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            onItemsPerPageChange={onItemsPerPageChange}
                            page={page}
                            setPage={setPage}
                            isVisible={currentMode === "View" && currentStat !== null}
                            setRows={setRows}
                            user={user}
                            editSet={editSet}
                            setEditSet={setEditSet}
                        />
                    )}
                </>
            )}

            <TouchableOpacity onPress={() => setCurrentMode("Add")}>
                <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="white"
                    style={{ alignSelf: 'center', margin: 0 }}
                />
            </TouchableOpacity>

            {currentMode == "Add" && (<AddStat team_id={user?.team_id} currentMode={currentMode} setCurrentMode={setCurrentMode} />)}
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
    imageWrapper: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between'
    },
    image: { 
        tintColor: '#fff',
        width: 52,
        height: 52 
    },
});
