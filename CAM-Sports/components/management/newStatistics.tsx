import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'; // Example dropdown library
import axiosInstance from '@/utils/axios';

type Score = {
  team_score: number;
  opposite_team_score: number;
};

export type GameStats = {
  _id: any;
  team_id: string;
  opposite_team_name: string;
  game_date: object;
  team_sets_won_count: number;
  team_sets_lost_count: number;
  sets_scores: { [key: string]: Score };
  team_stats: any[]; // Assuming team_stats is an array of player statistics
};

export type Row = {
  player: string;
  starter: boolean;
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

const allCols = [
  'Player',
  'Starter',
  'Position',
  'Attacks',
  'Kills',
  'Errors',
  'KillPercentage',
  'Serves',
  'Aces',
  'ServeErrors',
  'AcePercentage',
  'SetAttempts',
  'Assists',
  'SetErrors',
  'Digs',
  'DigErrors',
  'DigsEfficiency',
  'ServeRecieves',
  'ServeRecieveOne',
  'ServeRecieveTwo',
  'ServeRecieveThree',
  'ServeRecieveErrors',
  'ServeReciveScore',
  'Blocks',
  'BlockKills',
  'BlockErrors',
];

interface Game {
  id: string;
  name: string;
}

interface GameStatisticsManagerProps {
  // Define any props this component might receive
}

const GameStatisticsManager: React.FC<GameStatisticsManagerProps> = ({}) => {
  const [games, setGames] = useState<Game[]>([]); // Initialize as an empty array
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Row[]>([]); // Initialize as an empty array
  const [isEditing, setIsEditing] = useState(false);
  const [editableStatistics, setEditableStatistics] = useState<Row[]>([]); // Initialize as an empty array

  const fetchGames = useCallback(async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axiosInstance.get<Game[]>('YOUR_GAMES_API_ENDPOINT');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, [axiosInstance]); // Add axiosInstance to the dependency array

  const fetchStatistics = useCallback(async (gameId: string) => {
    try {
      // Replace with your actual API endpoint for statistics
      const response = await axiosInstance.get<GameStats>(`YOUR_STATISTICS_API_ENDPOINT?gameId=${gameId}`);
      const fetchedStats: Row[] = response.data.team_stats.map((playerStats: any) => ({
        player: playerStats?.player || "",
        starter: playerStats?.starter || false,
        position: playerStats?.position || "",
        attacks: playerStats?.attack?.attempts || 0,
        kills: playerStats?.attack?.kills || 0,
        errors: playerStats?.attack?.errors || 0,
        killPercentage: playerStats?.attack?.kill_percentage || 0,
        serves: playerStats?.serve?.attempts || 0,
        aces: playerStats?.serve?.aces || 0,
        serveErrors: playerStats?.serve?.errors || 0,
        acePercentage: playerStats?.serve?.ace_percentage || 0,
        setAttempts: playerStats?.setting?.attempts || 0,
        assists: playerStats?.setting?.assists || 0,
        setErrors: playerStats?.setting?.errors || 0,
        digs: playerStats?.digs?.attempts || 0,
        digErrors: playerStats?.digs?.errors || 0,
        digsEfficiency: playerStats?.digs?.efficiency || 0,
        serveRecieves: playerStats?.serve_recieves?.attempts || 0,
        serveRecieveOne: playerStats?.serve_recieves?.one_balls || 0,
        serveRecieveTwo: playerStats?.serve_recieves?.two_balls || 0,
        serveRecieveThree: playerStats?.serve_recieves?.three_balls || 0,
        serveRecieveErrors: playerStats?.serve_recieves?.errors || 0,
        serveReciveScore: playerStats?.serve_recieves?.efficiency || 0,
        blocks: playerStats?.blocks?.attempts || 0,
        blockKills: playerStats?.blocks?.kills || 0,
        blockErrors: playerStats?.blocks?.errors || 0,
      }));
      setStatistics(fetchedStats);
      setEditableStatistics(fetchedStats.map(stat => ({ ...stat }))); // Initialize editable state
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [axiosInstance]); // Add axiosInstance to the dependency array

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (selectedGameId) {
      fetchStatistics(selectedGameId);
      setIsEditing(false); // Reset to view mode on game selection
    } else {
      setStatistics([]); // Reset statistics when no game is selected
      setEditableStatistics([]); // Reset editable statistics as well
    }
  }, [selectedGameId, fetchStatistics]);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleEditStatistic = (index: number, key: string, value: string | number) => {
    const updatedStatistics = [...editableStatistics];
    if (updatedStatistics[index]) {
      updatedStatistics[index][key] = value;
      setEditableStatistics(updatedStatistics);
    }
  };

  const handleSaveStatistics = () => {
    // Implement your save logic here, e.g., API call to update data
    console.log('Saving statistics:', editableStatistics);
    setStatistics(editableStatistics);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditableStatistics(statistics.map(stat => ({ ...stat })));
    setIsEditing(false);
  };

  const gameListData = games.map(game => ({ label: game.name, value: game.id }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Game</Text>
      {games.length > 0 && (
        <SelectList
          data={gameListData}
          setSelected={handleGameSelect}
          placeholder="Choose a game"
          searchPlaceholder="Search games"
          boxStyles={styles.dropdownBox}
        />
      )}

      {selectedGameId && (
        <View style={styles.statisticsContainer}>
          <Text style={styles.subheader}>{games.find(game => game.id === selectedGameId)?.name} Statistics</Text>

          {statistics.length > 0 ? (
            isEditing ? (
              <EditableStatisticsTable
                data={editableStatistics}
                onEdit={handleEditStatistic}
                columns={allCols}
              />
            ) : (
              <StatisticsTable data={statistics} columns={allCols} />
            )
          ) : (
            <Text>No statistics available for this game.</Text>
          )}

          <View style={styles.buttonContainer}>
            {!isEditing ? (
              <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
                <Text style={styles.buttonText}>Edit Statistics</Text>
              </TouchableOpacity>
            ) : (
              <View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveStatistics}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

interface StatisticsTableProps {
  data: Row[];
  columns: string[];
}

const StatisticsTable: React.FC<StatisticsTableProps> = ({ data, columns }) => {
  if (data.length === 0) {
    return <Text>No data to display.</Text>;
  }

  return (
    <ScrollView horizontal style={styles.tableScrollView}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Text key={column} style={styles.headerCell}>{column}</Text>
          ))}
        </View>
        {data.map((row, index) => (
          <View key={index} style={styles.row}>
            {columns.map((column) => (
              <Text key={`${index}-${column}`} style={styles.cell}>{row[column.toLowerCase()]?.toString()}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

interface EditableStatisticsTableProps {
  data: Row[];
  onEdit: (index: number, key: string, value: string | number) => void;
  columns: string[];
}

const EditableStatisticsTable: React.FC<EditableStatisticsTableProps> = ({ data, onEdit, columns }) => {
  if (data.length === 0) {
    return <Text>No data to edit.</Text>;
  }

  return (
    <ScrollView horizontal style={styles.tableScrollView}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Text key={column} style={styles.headerCell}>{column}</Text>
          ))}
        </View>
        {data.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {columns.map((column, columnIndex) => (
              <TextInput
                key={`${rowIndex}-${column}`}
                style={styles.editableCell}
                value={row[column.toLowerCase()]?.toString()}
                onChangeText={(text) => onEdit(rowIndex, column.toLowerCase(), text)}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  dropdownBox: {
    borderColor: '#ccc',
    borderRadius: 5,
  },
  statisticsContainer: {
    marginTop: 20,
  },
  tableScrollView: {
    marginVertical: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  editableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default GameStatisticsManager;
