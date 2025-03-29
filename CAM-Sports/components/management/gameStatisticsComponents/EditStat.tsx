import * as React from 'react';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { GameStats, Row } from '../statistics';
import axiosInstance from '@/utils/axios';
import { Button, StyleSheet, View } from 'react-native';
import SetScores from './SetScores';

const columns: GridColDef[] = [
    {
        field: "id",
        headerName: "ID",
        type: "number",
        width: 180,
        editable: false,
    },
    {
        field: "player",
        headerName: "Player",
        width: 180,
        editable: false,
    },
    {
        field: "starter",
        headerName: "Starter",
        width: 180,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['true', 'false'],
    },
    {
        field: "position",
        headerName: "Position",
        width: 180,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['Outside Hitter', 'Middle Blocker', 'Setter', 'Opposite Hitter', 'Libero'],
    },
    {
        field: "attacks",
        headerName: "Attacks",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "kills",
        headerName: "Kills",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "errors",
        headerName: "Errors",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serves",
        headerName: "Serves",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "aces",
        headerName: "Aces",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveErrors",
        headerName: "Serve Errors",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "setAttempts",
        headerName: "Set Attempts",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "assists",
        headerName: "Assists",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "setErrors",
        headerName: "Set Errors",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "digs",
        headerName: "Digs",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "digErrors",
        headerName: "Dig Errors",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveRecieves",
        headerName: "Serve Recieves",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveRecieveOne",
        headerName: "1",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveRecieveTwo",
        headerName: "2",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveRecieveThree",
        headerName: "3",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "serveRecieveErrors",
        headerName: "Serve Recieve Errors",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "blocks",
        headerName: "Blocks",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "blockKills",
        headerName: "Block Kills",
        width: 180,
        editable: true,
        type: "number",
    },
    {
        field: "blockErrors",
        headerName: "Block Errors",
        width: 180,
        editable: true,
        type: "number",
    },
];

type EditableRow = {
    id?: number;
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

interface FullFeaturedCrudGridProps {
    initialRows: Row[];
    currentStat: GameStats;
    setCurrentMode: (mode: string) => void;
}

export default function FullFeaturedCrudGrid(props: FullFeaturedCrudGridProps) {
    const [rows, setRows] = React.useState<EditableRow[]>([]);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
    const [editStats, setEditStats] = React.useState(true);
    const setCurrentMode = props.setCurrentMode;

    React.useEffect(() => {
        let tempRows = props.initialRows.map((row, index) => {
            const { killPercentage, acePercentage, digsEfficiency, serveReciveScore, ...rest } = row;
            return {
                id: index + 1,
                ...rest
            }
        });
        setRows(tempRows);
    }, [props.initialRows]);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: number) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: number) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleCancelClick = (id: number) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = async (newRow: GridRowModel) => {
        const updatedRow = { ...newRow };

        const rowForBackend = {
            id: props.currentStat?._id?.$oid,
            team_stats: {
                [updatedRow.player]: {
                    position: updatedRow.position,
                    starter: updatedRow.starter == "true" ? true : false,
                    attack: {
                        attempts: updatedRow.attacks,
                        kills: updatedRow.kills,
                        errors: updatedRow.errors,
                        kill_percentage: (updatedRow.kills / updatedRow.attacks) * 100,
                    },
                    serve: {
                        attempts: updatedRow.serves,
                        aces: updatedRow.aces,
                        errors: updatedRow.serveErrors,
                        ace_percentage: (updatedRow.aces / updatedRow.serves) * 100,
                    },
                    serve_recieves: {
                        attempts: updatedRow.serveRecieves,
                        one_balls: updatedRow.serveRecieveOne,
                        two_balls: updatedRow.serveRecieveTwo,
                        three_balls: updatedRow.serveRecieveThree,
                        errors: updatedRow.serveRecieveErrors,
                        efficiency: (updatedRow.serveRecieveOne + (2 * updatedRow.serveRecieveTwo) + (3 * updatedRow.serveRecieveThree) - updatedRow.serveRecieveErrors) / updatedRow.serveRecieves,
                    },
                    digs: {
                        attempts: updatedRow.digs,
                        errors: updatedRow.digErrors,
                        efficiency: ((updatedRow.digs - updatedRow.digErrors) / updatedRow.digs) * 100,
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
        }
        const response = await axiosInstance.put(
            '/game_statistics/update',
            rowForBackend,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status !== 200) {
            console.error('Failed to update row', response.data);
            return;
        }

        setRows(rows.map((row) => (row.id === newRow.id ? (updatedRow as EditableRow) : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const getActions = ({ id }: { id: GridRowId }) => {
        const rowId = id as number;
        const isInEditMode = rowModesModel[rowId]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
            return [
                <GridActionsCellItem
                    icon={<SaveIcon />}
                    label="Save"
                    sx={{
                        color: 'primary.main',
                    }}
                    onClick={handleSaveClick(rowId)}
                />,
                <GridActionsCellItem
                    icon={<CancelIcon />}
                    label="Cancel"
                    className="textPrimary"
                    onClick={handleCancelClick(rowId)}
                    color="inherit"
                />,
            ];
        }

        return [
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(rowId)}
                color="inherit"
            />,
        ];
    };

    const actionColumn: GridColDef = React.useMemo(
        () => ({
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions,
        }),
        [getActions],
    );

    const allColumns = [...columns, actionColumn];

    const deleteStat = async () => {
        const response = await axiosInstance.delete(`/game_statistics/game_id/${props.currentStat?._id?.$oid}`);
        if (response.status === 200) {
            console.log('Deleted stat');
        }

        setCurrentMode('View');
    }

    let newScores = [];
    for (let set in props.currentStat.sets_scores) {
        newScores.push({
            team_points: props.currentStat.sets_scores[set].team_score,
            opposite_team_points: props.currentStat.sets_scores[set].opposite_team_score
        });
    }

    return (
        <div>

            <View style={styles.menu}>
                {editStats ?
                    (<Button title="Sets" onPress={() => setEditStats(!editStats)} />)
                    :
                    (<Button title="Stats" onPress={() => setEditStats(!editStats)} />)
                }
            </View>

            <Box
                sx={{
                    height: 500,
                    width: '100%',
                    '& .actions': {
                        color: 'text.secondary',
                    },
                    '& .textPrimary': {
                        color: 'text.primary',
                    },
                }}
            >
                {editStats ?
                (
                    <DataGrid
                        rows={rows}
                        columns={allColumns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={handleRowModesModelChange}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        getRowId={(row) => row.id}
                    />
                ) :
                (
                    <SetScores currentStat={props.currentStat} setCurrentMode={props.setCurrentMode} sets={newScores} />
                )}


                <View style={styles.delete}>
                    <Button title="Delete" onPress={deleteStat} color='red' />
                </View>
            </Box>
        </div>

    );
}

const styles = StyleSheet.create({
    delete: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
    },
    menu: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
});
