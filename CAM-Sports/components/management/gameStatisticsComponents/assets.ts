export type Score = {
    team_score: number;
    opposite_team_score: number;
}

export type GameStats = {
    _id: any;
    team_id: string;
    opposite_team_name: string;
    game_date: { $date: string };
    team_sets_won_count: number;
    team_sets_lost_count: number;
    sets_scores: { [key: string]: Score };
    team_stats: { [key: string]: any };
}

export const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

export const offenseCols = [
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

export const settingCols = [
    "Player",
    "Starter",
    "Position",
    "Set Attempts",
    "Assists",
    "Set Errors",
]

export const defenseCols = [
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

export const allCols = [
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

export type DataRow = {
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
