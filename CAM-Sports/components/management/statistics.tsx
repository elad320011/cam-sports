import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

type Row = {
    player: string;
    hits: number;
    errors: number;
    kills: number;
    assists: number;
    blocks: number;
    digs: number;
    serves: number;
    aces: number;
    serveErrors: number;
}

export default function GameStatistics() {

    const cols = [
        "Player",
        "Hits",
        "Errors",
        "Kills",
        "Assists",
        "Blocks",
        "Digs",
        "Serves",
        "Aces",
        "Serve Errors"
    ];
    const rows: Row[] = [];

    return (
        <Collapsible title="Game Statistics">
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
                    {rows.map((row, index) => (
                        <TableRow
                        key={row.player}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.player}
                            </TableCell>
                            <TableCell align="right">{row.hits}</TableCell>
                            <TableCell align="right">{row.errors}</TableCell>
                            <TableCell align="right">{row.kills}</TableCell>
                            <TableCell align="right">{row.assists}</TableCell>
                            <TableCell align="right">{row.blocks}</TableCell>
                            <TableCell align="right">{row.digs}</TableCell>
                            <TableCell align="right">{row.serves}</TableCell>
                            <TableCell align="right">{row.aces}</TableCell>
                            <TableCell align="right">{row.serveErrors}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Collapsible>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        textAlign: "center",
    },
});
