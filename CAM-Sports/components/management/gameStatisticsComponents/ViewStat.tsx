import { DataTable, Card, Button as ActionButton } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { PressableStateCallbackType, ScrollView, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import axiosInstance from '@/utils/axios';
import { ButtonGroupWrapper } from '../../ButtonGroupWrapper';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { GameStats } from './assets';
import { DataRow } from './assets';
import { useAuth } from "@/contexts/AuthContext";

type ScoreChangeObject = {
    set: string;
    teamScore: number;
    oppositeTeamScore: number;
    action: 'add' | 'update';
}

type ViewStatProps = {
    currentStat: GameStats | null;
    setCurrentStat: React.Dispatch<React.SetStateAction<GameStats | null>>;
    rows: DataRow[];
    cols: string[];
    from: number;
    to: number;
    itemsPerPage: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    numberOfItemsPerPageList: number[];
    isVisible: boolean;
    setRows: React.Dispatch<React.SetStateAction<DataRow[] | []>>;
    editSet: string;
    setEditSet: React.Dispatch<React.SetStateAction<string>>;
};

export default function ViewStat(props: ViewStatProps) {

    const {
        currentStat,
        setCurrentStat,
        rows,
        cols,
        from,
        to,
        itemsPerPage,
        page,
        setPage,
        numberOfItemsPerPageList,
        isVisible,
        setRows,
        editSet,
        setEditSet
    } = props;

    const [liveStat, setLiveStat] = useState<any>(currentStat);
    const { logout, user } = useAuth();
    const [currentViewMode, setCurrentViewMode] = useState<'Sets' | 'Stats'>('Sets');
    const [changedCard, setChangedCard] = useState<ScoreChangeObject | null>({
        set: "",
        teamScore: 0,
        oppositeTeamScore: 0,
        action: 'add',
    });
    const [liveRows, setLiveRows] = React.useState<DataRow[]>([]);
    useEffect(() => {
        let tempRows = [];

        for (let row of rows) {
            tempRows.push({
                player: row.player,
                starter: row.starter,
                position: row.position,
                attacks: row.attacks,
                kills: row.kills,
                errors: row.errors,
                killPercentage: row.killPercentage,
                serves: row.serves,
                aces: row.aces,
                serveErrors: row.serveErrors,
                acePercentage: row.acePercentage,
                setAttempts: row.setAttempts,
                assists: row.assists,
                setErrors: row.setErrors,
                digs: row.digs,
                digErrors: row.digErrors,
                digsEfficiency: row.digsEfficiency,
                serveRecieves: row.serveRecieves,
                serveRecieveOne: row.serveRecieveOne,
                serveRecieveTwo: row.serveRecieveTwo,
                serveRecieveThree: row.serveRecieveThree,
                serveRecieveErrors: row.serveRecieveErrors,
                serveReciveScore: row.serveReciveScore,
                blocks: row.blocks,
                blockKills: row.blockKills,
                blockErrors: row.blockErrors,
            });
        }
        setLiveRows(tempRows);
    }, [rows]);

    const editRow = async (player: string, field: string, value: any) => {
        const rowIndex = liveRows.findIndex(row => row.player === player);

        if (rowIndex !== -1) {
            const updatedRow = { ...liveRows[rowIndex], [field]: value };
            const updatedRows = [...liveRows];
            updatedRows[rowIndex] = updatedRow;
            setLiveRows(updatedRows);

            // Calculate formatted values
            const killPercentage = (Number(updatedRow.kills) / Number(updatedRow.attacks)) * 100;
            const formattedKillPercentage = isNaN(killPercentage) ? 0 : parseFloat(killPercentage.toFixed(2));

            const acePercentage = (Number(updatedRow.aces) / Number(updatedRow.serves)) * 100;
            const formattedAcePercentage = isNaN(acePercentage) ? 0 : parseFloat(acePercentage.toFixed(2));

            const serveReceiveNumerator = Number(updatedRow.serveRecieveOne) + (2 * Number(updatedRow.serveRecieveTwo)) + (3 * Number(updatedRow.serveRecieveThree)) - Number(updatedRow.serveRecieveErrors);
            const serveReceiveEfficiency = serveReceiveNumerator / Number(updatedRow.serveRecieves);
            const formattedServeReceiveEfficiency = isNaN(serveReceiveEfficiency) ? 0 : parseFloat(serveReceiveEfficiency.toFixed(2));

            const digsEfficiencyCalc = (Number(updatedRow.digs) - Number(updatedRow.digErrors)) / Number(updatedRow.digs) * 100;
            const formattedDigsEfficiency = isNaN(digsEfficiencyCalc) ? 0 : parseFloat(digsEfficiencyCalc.toFixed(2));


            const response = await axiosInstance.put(
                '/game_statistics/update',
                {
                    id: currentStat?._id?.$oid,
                    team_stats: {
                        [updatedRow.player as string]: {
                            position: updatedRow.position,
                            starter: updatedRow.starter == "true" ? true : false,
                            attack: {
                                attempts: updatedRow.attacks,
                                kills: updatedRow.kills,
                                errors: updatedRow.errors,
                                kill_percentage: formattedKillPercentage, // Use formatted value
                            },
                            serve: {
                                attempts: updatedRow.serves,
                                aces: updatedRow.aces,
                                errors: updatedRow.serveErrors,
                                ace_percentage: formattedAcePercentage, // Use formatted value
                            },
                            serve_recieves: {
                                attempts: updatedRow.serveRecieves,
                                one_balls: updatedRow.serveRecieveOne,
                                two_balls: updatedRow.serveRecieveTwo,
                                three_balls: updatedRow.serveRecieveThree,
                                errors: updatedRow.serveRecieveErrors,
                                efficiency: formattedServeReceiveEfficiency, // Use formatted value
                            },
                            digs: {
                                attempts: updatedRow.digs,
                                errors: updatedRow.digErrors,
                                efficiency: formattedDigsEfficiency, // Use formatted value
                            },
                            setting: {
                                attempts: updatedRow.setAttempts,
                                assists: updatedRow.assists,
                                errors: updatedRow.setErrors,
                            },
                            blocks: {
                                attempts: updatedRow.blocks,
                                kills: updatedRow.blockKills,
                                errors: updatedRow.blockErrors,
                            },
                        }
                    }

                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.status !== 200) {
                console.error('Failed to update row', response.data);
                return;
            }
        }
    };

    const safeNumber = (val: any): number => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    };

    const updateSets = async () => {
        let teamSetsWonCount = 0;
        let teamSetsLostCount = 0;
        let updatedSetsScores: { [key: string]: { team_score: number; opposite_team_score: number } } = {};
        let tempStat = currentStat;

        if (changedCard?.action === "update") {
            updatedSetsScores = { ...currentStat?.sets_scores };

            updatedSetsScores[changedCard.set] = {
                team_score: safeNumber(changedCard.teamScore), // Use safeNumber
                opposite_team_score: safeNumber(changedCard.oppositeTeamScore), // Use safeNumber
            };
        } else if (changedCard?.action === "add") {
            updatedSetsScores = { ...currentStat?.sets_scores };
            const newSetKey = (Object.keys(updatedSetsScores).length + 1).toString();

            updatedSetsScores[newSetKey] = {
                team_score: safeNumber(changedCard.teamScore), // Use safeNumber
                opposite_team_score: safeNumber(changedCard.oppositeTeamScore), // Use safeNumber
            };
        }

        if (tempStat) {
            tempStat.sets_scores = updatedSetsScores;
            setLiveStat(tempStat);
        }

        // Calculate team_sets_won_count and team_sets_lost_count
        for (const setId in updatedSetsScores) {
            if (updatedSetsScores.hasOwnProperty(setId)) {
                const set = updatedSetsScores[setId];
                if (set.team_score > set.opposite_team_score) {
                    teamSetsWonCount++;
                } else if (set.team_score < set.opposite_team_score) {
                    teamSetsLostCount++;
                }
            }
        }

        // Only proceed with the API call if changedCard exists and has an action
        if (changedCard?.action) {
            const payload = {
                id: currentStat?._id?.$oid,
                sets_scores: updatedSetsScores,
                team_sets_won_count: teamSetsWonCount,
                team_sets_lost_count: teamSetsLostCount,
            };

            try {
                const response = await axiosInstance.put(
                    '/game_statistics/update',
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status !== 200) {
                    console.error('Failed to update row', response.data);
                } else {
                    if (changedCard?.action === "update") {
                        setEditSet("");
                        setChangedCard(null);
                    }
                }
            } catch (error) {
                console.error('Error updating game statistics:', error);
            }
        }
    };

    return (
    <>
        <Modal
            supportedOrientations={['landscape']}
            animationIn={"slideInUp"}
            animationOut={"slideOutDown"}
            style={{ display: "flex", alignContent: "center", justifyContent: "center", margin: 0 }}
            isVisible={isVisible}
        >

            <Card style = {{ width: '100%', height: 500, backgroundColor: '#0c1c2c', overflow: 'visible', margin: 0, padding: 10 }}>
                <View style={{ padding: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                    <TouchableOpacity
                        style={{ alignSelf: 'flex-end' }}
                        onPress={() => setCurrentStat(null)}
                    >
                        <Ionicons
                            name="close-outline"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
                <ButtonGroupWrapper
                    buttons = {["Sets", "Stats"]}
                    selectedIndex={currentViewMode === "Sets" ? 0 : currentViewMode === "Stats" ? 1 : 2}
                    onPress={(index) => {
                        if (index === 0) {
                            setCurrentViewMode("Sets");
                        } else {
                            setCurrentViewMode("Stats");
                        }
                    }}
                    containerStyle={{ marginBottom: 40, backgroundColor: '#808080', borderColor: 'transparent' }}
                    textStyle={{ color: '#cdd1ce', fontWeight: 'bold' }}
                />
                    {currentViewMode === "Sets" ?
                    (
                        <>
                            <ScrollView contentContainerStyle={{ alignItems: "center", width: '100%'}}>
                                {
                                    Object.keys(liveStat.sets_scores).map((set, index) => {
                                        return (
                                            <View style={{width: '100%', justifyContent: 'center', alignItems:'center'}} key={index}>
                                                <Card key={index} style={{ width: '90%', marginBottom: 20, backgroundColor: 'transparent', borderColor: '#0c1c2c' }}>
                                                    <Card.Title titleStyle={{ color: 'white' }} style={{ marginTop: 10 }} title={`Set ${index + 1}`} />
                                                    <Card.Content>
                                                        {editSet === set ? (
                                                            <>
                                                                <TextInput
                                                                    style={{ fontSize: 16, marginBottom: 10, color: '#808080' }}
                                                                    placeholder="Team Score"
                                                                    keyboardType="numeric"
                                                                    value={safeNumber(changedCard?.teamScore).toString() || ""}
                                                                    onChangeText={(text) => setChangedCard({
                                                                        set: set,
                                                                        teamScore: parseInt(text, 10),
                                                                        oppositeTeamScore: parseInt(changedCard?.oppositeTeamScore?.toString() || "0", 10),
                                                                        action: 'update',
                                                                    })}
                                                                />
                                                                <TextInput
                                                                    style={{ fontSize: 16, marginBottom: 10, color: '#808080' }}
                                                                    placeholder="Opposite Team Score"
                                                                    keyboardType="numeric"
                                                                    value={safeNumber(changedCard?.oppositeTeamScore).toString() || ""}
                                                                    onChangeText={(text) => setChangedCard({
                                                                        set: set,
                                                                        teamScore: parseInt(changedCard?.teamScore ?.toString() || "0", 10),
                                                                        oppositeTeamScore: parseInt(text, 10),
                                                                        action: 'update',
                                                                    })}
                                                                />
                                                            </>
                                                        ): (
                                                            <>
                                                                <Text style={{ fontSize: 16, color: '#808080' }}>
                                                                    {user?.team_id}: {currentStat?.sets_scores[set].team_score}
                                                                </Text>
                                                                <Text style={{ fontSize: 16, color: '#808080' }}>
                                                                    {currentStat?.opposite_team_name}: {currentStat?.sets_scores[set].opposite_team_score}
                                                                </Text>
                                                            </>
                                                        )}

                                                    </Card.Content>
                                                    <Card.Actions>
                                                        { editSet === set ? (
                                                            <>
                                                                <TouchableOpacity onPress={() => {
                                                                    setEditSet("");
                                                                    setChangedCard(null);
                                                                }}>
                                                                    <Ionicons
                                                                        name="close-sharp"
                                                                        size={22}
                                                                        color="white"
                                                                        style={{ marginBottom: 10, marginRight: 7 }}
                                                                    />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => updateSets()}>
                                                                    <Ionicons
                                                                        name="save-sharp"
                                                                        size={22}
                                                                        color="white"
                                                                        style={{ marginBottom: 10, marginRight: 10 }}
                                                                    />
                                                                </TouchableOpacity>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TouchableOpacity onPress={() => setEditSet(set)}>
                                                                    <Ionicons
                                                                        name="create-outline"
                                                                        size={24}
                                                                        color="white"
                                                                        style={{ marginRight: 10, marginBottom: 10 }}
                                                                    />
                                                                </TouchableOpacity>
                                                            </>
                                                        )}

                                                    </Card.Actions>
                                                </Card>
                                            </View>
                                        );
                                    })
                                }
                            </ScrollView>
                            <>
                                {Object.keys(currentStat?.sets_scores ?? {}).length <= 4 && editSet == "" && (

                                    <TouchableOpacity
                                        onPress={async () => {
                                            await setChangedCard({
                                                set: (Object.keys(currentStat?.sets_scores ?? {}).length + 1).toString(),
                                                teamScore: 0,
                                                oppositeTeamScore: 0,
                                                action: 'add',
                                            });
                                            setEditSet((Object.keys(currentStat?.sets_scores ?? {}).length + 1).toString());
                                            updateSets();
                                        }}
                                    >
                                        <Ionicons
                                            name="add-circle-outline"
                                            size={32}
                                            color="white"
                                            style={{ marginBottom: 10, marginRight: 10, alignSelf: 'center' }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </>
                        </>
                    )
                    :
                    (
                        <ScrollView horizontal={true} contentContainerStyle={{ justifyContent: "center"}}>
                            <DataTable>
                                <DataTable.Header>
                                    {
                                        cols.map((col: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | (string & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (string & Iterable<React.ReactNode>) | (string & React.ReactPortal) | (number & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (number & Iterable<React.ReactNode>) | (number & React.ReactPortal) | (false & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (false & Iterable<React.ReactNode>) | (false & React.ReactPortal) | (true & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (true & Iterable<React.ReactNode>) | (true & React.ReactPortal) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & string) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & number) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & false) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & true) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & Iterable<React.ReactNode>) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & React.ReactPortal) | (Iterable<React.ReactNode> & string) | (Iterable<React.ReactNode> & number) | (Iterable<React.ReactNode> & false) | (Iterable<React.ReactNode> & true) | (Iterable<React.ReactNode> & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (Iterable<React.ReactNode> & React.ReactPortal) | (React.ReactPortal & string) | (React.ReactPortal & number) | (React.ReactPortal & false) | (React.ReactPortal & true) | (React.ReactPortal & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (React.ReactPortal & Iterable<React.ReactNode>) | (((state: PressableStateCallbackType) => React.ReactNode) & string) | (((state: PressableStateCallbackType) => React.ReactNode) & number) | (((state: PressableStateCallbackType) => React.ReactNode) & false) | (((state: PressableStateCallbackType) => React.ReactNode) & true) | (((state: PressableStateCallbackType) => React.ReactNode) & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (((state: PressableStateCallbackType) => React.ReactNode) & Iterable<React.ReactNode>) | (((state: PressableStateCallbackType) => React.ReactNode) & React.ReactPortal) | null | undefined, index: React.Key | null | undefined) => (
                                            <DataTable.Title key={index} textStyle={{ color: 'white' }} style={styles.cell}>{col}</DataTable.Title>
                                        ))
                                    }
                                </DataTable.Header>

                                {liveRows.slice(from, to).map((item: { player: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined; starter: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; position: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; attacks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; kills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; errors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; killPercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; aces: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; acePercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; setAttempts: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; assists: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; setErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digs: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digsEfficiency: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveOne: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveTwo: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveThree: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveReciveScore: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blocks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blockKills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blockErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                                    <DataTable.Row key={String(item.player)}>
                                        <DataTable.Cell centered style={styles.cell}>
                                            <TextInput
                                                value={String(item.player)}
                                                style={{ color: 'white' }}
                                                editable={false}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.starter)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'starter', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.position)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'position', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.attacks)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'attacks', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.kills)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'kills', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.errors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'errors', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.killPercentage)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'killPercentage', text)}
                                                editable={false}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serves)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serves', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.aces)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'aces', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveErrors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveErrors', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.acePercentage)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'acePercentage', text)}
                                                editable={false}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.setAttempts)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'setAttempts', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.assists)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'assists', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.setErrors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'setErrors', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.digs)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'digs', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.digErrors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'digErrors', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.digsEfficiency)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'digsEfficiency', text)}
                                                editable={false}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveRecieves)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveRecieves', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveRecieveOne)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveRecieveOne', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveRecieveTwo)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveRecieveTwo', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveRecieveThree)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveRecieveThree', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveRecieveErrors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveRecieveErrors', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.serveReciveScore)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'serveReciveScore', text)}
                                                editable={false}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.blocks)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'blocks', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.blockKills)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'blockKills', text)}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={styles.cell}>
                                            <TextInput
                                                value={String(item.blockErrors)}
                                                style={{ color: 'white' }}
                                                onChangeText={(text) => editRow(item.player as string, 'blockErrors', text)}
                                            />
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))}

                                <DataTable.Pagination
                                    page={page}
                                    numberOfPages={Math.ceil(liveRows.length / itemsPerPage)}
                                    onPageChange={(page) => setPage(page)}
                                    label={`${from + 1}-${to} of ${liveRows.length}`}
                                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                                    numberOfItemsPerPage={itemsPerPage}
                                    selectPageDropdownLabel={'Rows per page'}
                                    showFastPaginationControls={true}
                                    style={{justifyContent: 'flex-start', width: '10%', backgroundColor: '#808080', marginTop: 10}}
                                />
                            </DataTable>
                        </ScrollView>
                    )}
            </Card>
        </Modal>
    </>
    );
}

const styles = StyleSheet.create({
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        width: 160,
    },
});
