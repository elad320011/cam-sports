import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

type Row = {
    player: string;
    attacks: number;
    kills: number;
    errors: number;
    setAttempts: number;
    assists: number;
    setErrors: number;
    digs: number;
    digErrors: number;
    serves: number;
    aces: number;
    serveErrors: number;
}

export default function GameStatistics() {

    const cols = [
        "Player",
        "Attacks",
        "Kills",
        "Errors",
        "Set Attempts",
        "Assists",
        "Set Errors",
        "Digs",
        "Dig Errors",
        "Serves",
        "Aces",
        "Serve Errors"
    ];
    let rows: Row[] = [];

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
                            <TableCell align="right">{row.attacks}</TableCell>
                            <TableCell align="right">{row.kills}</TableCell>
                            <TableCell align="right">{row.errors}</TableCell>
                            <TableCell align="right">{row.setAttempts}</TableCell>
                            <TableCell align="right">{row.assists}</TableCell>
                            <TableCell align="right">{row.setErrors}</TableCell>
                            <TableCell align="right">{row.digs}</TableCell>
                            <TableCell align="right">{row.digErrors}</TableCell>
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
