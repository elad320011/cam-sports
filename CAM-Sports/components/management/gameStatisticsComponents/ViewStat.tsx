import { DataTable, Card, Button as ActionButton } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { Button, Modal, PressableStateCallbackType, ScrollView, StyleSheet, TextInput, Text } from 'react-native';
import axiosInstance from '@/utils/axios';
import { ButtonGroup } from '@rneui/themed';

type DataRow = {
    player: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined;
    starter: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    position: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    attacks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    kills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    errors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    killPercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    aces: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    acePercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    setAttempts: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    assists: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    setErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    digs: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    digErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    digsEfficiency: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveRecieves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveRecieveOne: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveRecieveTwo: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveRecieveThree: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveRecieveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    serveReciveScore: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    blocks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    blockKills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
    blockErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
};

type ScoreChangeObject = {
    set: string;
    teamScore: number;
    oppositeTeamScore: number;
    action: 'add' | 'update';
}

export default function ViewStat(props: any) {

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
        user,
        editSet,
        setEditSet
    } = props;

    const [liveStat, setLiveStat] = useState<any>(currentStat);
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
                                kill_percentage: (Number(updatedRow.kills) / Number(updatedRow.attacks)) * 100,
                            },
                            serve: {
                                attempts: updatedRow.serves,
                                aces: updatedRow.aces,
                                errors: updatedRow.serveErrors,
                                ace_percentage: (Number(updatedRow.aces) / Number(updatedRow.serves)) * 100,
                            },
                            serve_recieves: {
                                attempts: updatedRow.serveRecieves,
                                one_balls: updatedRow.serveRecieveOne,
                                two_balls: updatedRow.serveRecieveTwo,
                                three_balls: updatedRow.serveRecieveThree,
                                errors: updatedRow.serveRecieveErrors,
                                efficiency: (Number(updatedRow.serveRecieveOne) + (2 * Number((updatedRow.serveRecieveTwo)) + (3 * Number(updatedRow.serveRecieveThree)) - Number(updatedRow.serveRecieveErrors))) / Number(updatedRow.serveRecieves),
                            },
                            digs: {
                                attempts: updatedRow.digs,
                                errors: updatedRow.digErrors,
                                efficiency: (Number(updatedRow.digs) - Number(updatedRow.digErrors)) / Number(updatedRow.digs) * 100,
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

    const updateSets = async () => {
        let teamSetsWonCount = 0;
        let teamSetsLostCount = 0;
        let updatedSetsScores: { [key: string]: { team_score: number; opposite_team_score: number } } = {};
        let tempStat = currentStat;

        if (changedCard?.action === "update") {
            updatedSetsScores = { ...currentStat.sets_scores };

            updatedSetsScores[changedCard.set] = {
                team_score: changedCard.teamScore,
                opposite_team_score: changedCard.oppositeTeamScore,
            };
        } else if (changedCard?.action === "add") {
            updatedSetsScores = { ...currentStat.sets_scores };
            const newSetKey = (Object.keys(updatedSetsScores).length + 1).toString();

            updatedSetsScores[newSetKey] = {
                team_score: changedCard.teamScore,
                opposite_team_score: changedCard.oppositeTeamScore,
            };
        }

        tempStat.sets_scores = updatedSetsScores;
        setLiveStat(tempStat);

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
            animationType="slide"
            onRequestClose={() => setCurrentStat(null)}
            style={{ display: "flex", alignContent: "center", justifyContent: "center" }}
            visible={isVisible}
        >

                <ButtonGroup
                    buttons = {["Sets", "Stats"]}
                    selectedIndex={currentViewMode === "Sets" ? 0 : currentViewMode === "Stats" ? 1 : 2}
                    onPress={(index) => {
                        if (index === 0) {
                            setCurrentViewMode("Sets");
                        } else {
                            setCurrentViewMode("Stats");
                        }
                    }}
                    containerStyle={{ marginBottom: 40, width: '100%' }}
                />

                {currentViewMode === "Sets" ?
                (
                    <ScrollView contentContainerStyle={{ alignItems: "center", width: '100%'}}>
                        {
                            Object.keys(liveStat.sets_scores).map((set, index) => {
                                return (
                                    <>
                                        <Card key={index} style={{ width: '90%', marginBottom: 20 }}>
                                            <Card.Title title={`Set ${index + 1}`} />
                                            <Card.Content>
                                                {editSet === set ? (
                                                    <>
                                                        <TextInput
                                                            style={{ fontSize: 16, marginBottom: 10 }}
                                                            placeholder="Team Score"
                                                            keyboardType="numeric"
                                                            value={changedCard?.teamScore.toString() || ""}
                                                            onChangeText={(text) => setChangedCard({
                                                                set: set,
                                                                teamScore: parseInt(text, 10),
                                                                oppositeTeamScore: parseInt(changedCard?.oppositeTeamScore?.toString() || "0", 10),
                                                                action: 'update',
                                                             })}
                                                        />
                                                        <TextInput
                                                            style={{ fontSize: 16, marginBottom: 10 }}
                                                            placeholder="Opposite Team Score"
                                                            keyboardType="numeric"
                                                            value={changedCard?.oppositeTeamScore.toString() || ""}
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
                                                        <Text style={{ fontSize: 16 }}>
                                                            {user.team_id}: {currentStat.sets_scores[set].team_score}
                                                        </Text>
                                                        <Text style={{ fontSize: 16 }}>
                                                            {currentStat.opposite_team_name}: {currentStat.sets_scores[set].opposite_team_score}
                                                        </Text>
                                                    </>
                                                )}

                                            </Card.Content>
                                            <Card.Actions>
                                                { editSet === set ? (
                                                    <>
                                                        <ActionButton onPress={() => {
                                                            setEditSet("");
                                                            setChangedCard(null);
                                                        }} >Cancel</ActionButton>
                                                        <ActionButton onPress={() => updateSets()}>Ok</ActionButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ActionButton onPress={() => setEditSet(set)}>Edit</ActionButton>
                                                    </>
                                                )}

                                            </Card.Actions>
                                        </Card>
                                    {/* <Text key={index} style={{ fontSize: 16, marginVertical: 5 }}>
                                        Set {index + 1}: {currentStat.sets_scores[set].team_score} - {currentStat.sets_scores[set].opposite_team_score}
                                    </Text> */}
                                    </>
                                );
                            })
                        }
                        {Object.keys(currentStat.sets_scores).length <= 4 && editSet == "" && (
                            <ActionButton
                                mode="contained"
                                onPress={async () => {
                                    await setChangedCard({
                                        set: (Object.keys(currentStat.sets_scores).length + 1).toString(),
                                        teamScore: 0,
                                        oppositeTeamScore: 0,
                                        action: 'add',
                                    });
                                    setEditSet((Object.keys(currentStat.sets_scores).length + 1).toString());
                                    updateSets();
                                }}
                            >
                                +
                            </ActionButton>
                        )}
                    </ScrollView>
                )
                :
                (
                    <ScrollView horizontal={true} contentContainerStyle={{ justifyContent: "center"}}>
                        <DataTable>
                            <DataTable.Header>
                                {
                                    cols.map((col: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | (string & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (string & Iterable<React.ReactNode>) | (string & React.ReactPortal) | (number & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (number & Iterable<React.ReactNode>) | (number & React.ReactPortal) | (false & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (false & Iterable<React.ReactNode>) | (false & React.ReactPortal) | (true & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (true & Iterable<React.ReactNode>) | (true & React.ReactPortal) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & string) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & number) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & false) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & true) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & Iterable<React.ReactNode>) | (React.ReactElement<any, string | React.JSXElementConstructor<any>> & React.ReactPortal) | (Iterable<React.ReactNode> & string) | (Iterable<React.ReactNode> & number) | (Iterable<React.ReactNode> & false) | (Iterable<React.ReactNode> & true) | (Iterable<React.ReactNode> & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (Iterable<React.ReactNode> & React.ReactPortal) | (React.ReactPortal & string) | (React.ReactPortal & number) | (React.ReactPortal & false) | (React.ReactPortal & true) | (React.ReactPortal & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (React.ReactPortal & Iterable<React.ReactNode>) | (((state: PressableStateCallbackType) => React.ReactNode) & string) | (((state: PressableStateCallbackType) => React.ReactNode) & number) | (((state: PressableStateCallbackType) => React.ReactNode) & false) | (((state: PressableStateCallbackType) => React.ReactNode) & true) | (((state: PressableStateCallbackType) => React.ReactNode) & React.ReactElement<any, string | React.JSXElementConstructor<any>>) | (((state: PressableStateCallbackType) => React.ReactNode) & Iterable<React.ReactNode>) | (((state: PressableStateCallbackType) => React.ReactNode) & React.ReactPortal) | null | undefined, index: React.Key | null | undefined) => (
                                        <DataTable.Title key={index} style={styles.cell}>{col}</DataTable.Title>
                                    ))
                                }
                            </DataTable.Header>

                            {liveRows.slice(from, to).map((item: { player: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined; starter: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; position: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; attacks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; kills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; errors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; killPercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; aces: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; acePercentage: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; setAttempts: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; assists: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; setErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digs: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; digsEfficiency: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieves: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveOne: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveTwo: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveThree: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveRecieveErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; serveReciveScore: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blocks: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blockKills: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; blockErrors: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                                <DataTable.Row key={String(item.player)}>
                                    <DataTable.Cell centered style={styles.cell}>
                                        <TextInput
                                            value={String(item.player)}
                                            />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.starter)}
                                            onChangeText={(text) => editRow(item.player as string, 'starter', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.position)}
                                            onChangeText={(text) => editRow(item.player as string, 'position', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.attacks)}
                                            onChangeText={(text) => editRow(item.player as string, 'attacks', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.kills)}
                                            onChangeText={(text) => editRow(item.player as string, 'kills', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.errors)}
                                            onChangeText={(text) => editRow(item.player as string, 'errors', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.killPercentage)}
                                            onChangeText={(text) => editRow(item.player as string, 'killPercentage', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serves)}
                                            onChangeText={(text) => editRow(item.player as string, 'serves', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.aces)}
                                            onChangeText={(text) => editRow(item.player as string, 'aces', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveErrors)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveErrors', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.acePercentage)}
                                            onChangeText={(text) => editRow(item.player as string, 'acePercentage', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.setAttempts)}
                                            onChangeText={(text) => editRow(item.player as string, 'setAttempts', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.assists)}
                                            onChangeText={(text) => editRow(item.player as string, 'assists', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.setErrors)}
                                            onChangeText={(text) => editRow(item.player as string, 'setErrors', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.digs)}
                                            onChangeText={(text) => editRow(item.player as string, 'digs', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.digErrors)}
                                            onChangeText={(text) => editRow(item.player as string, 'digErrors', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.digsEfficiency)}
                                            onChangeText={(text) => editRow(item.player as string, 'digsEfficiency', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveRecieves)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveRecieves', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveRecieveOne)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveRecieveOne', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveRecieveTwo)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveRecieveTwo', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveRecieveThree)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveRecieveThree', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveRecieveErrors)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveRecieveErrors', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.serveReciveScore)}
                                            onChangeText={(text) => editRow(item.player as string, 'serveReciveScore', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.blocks)}
                                            onChangeText={(text) => editRow(item.player as string, 'blocks', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.blockKills)}
                                            onChangeText={(text) => editRow(item.player as string, 'blockKills', text)}
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.cell}>
                                        <TextInput
                                            value={String(item.blockErrors)}
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
                                style={{justifyContent: 'flex-start'}}
                            />
                        </DataTable>
                    </ScrollView>
                )}
                <Button title="Close" onPress={() => setCurrentStat(null)} />
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
