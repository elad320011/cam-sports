import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axios';
import { useState } from 'react';
import { TextInput, StyleSheet, NativeSyntheticEvent, TextInputChangeEventData, Button, View } from 'react-native';
import DatePicker from 'react-native-date-picker'

export default function AddStat(props: any) {
    const { logout, userInfo } = useAuth();
    const [rivalTeam, setRivalTeam] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const setCurrentMode = props.setCurrentMode;

    const team_id = userInfo?.team_id;

    const handleRivalChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setRivalTeam(event.nativeEvent.text);
    }

    const handleDateChange = ((event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setDatetime(event.nativeEvent.text);
    });

    const handleSubmit = async () => {

        // Get all team members
        const team_members_raw = await axiosInstance.get(`/team/get_players?team_name=${team_id}`);
        const team_members = team_members_raw.data?.players;
        const team_stats: Record<string, { position: string }> = {};

        for (let player of team_members) {
            const parsedPlayer = JSON.parse(player)
            team_stats[parsedPlayer.full_name as string] = {
                    position: parsedPlayer.role,
            };
        }

        const payload = {
            team_id: team_id,
            opposite_team_name: rivalTeam,
            game_date: datetime,
            team_stats: team_stats,
        }

        const response = await axiosInstance.post('/game_statistics/create', payload);
        if (response.status === 200) {
            setCurrentMode('Edit');
        }
    }

    return (
        <div style={styles.container}>
            <TextInput
                style={styles.input}
                onChange={handleRivalChange}
                value={rivalTeam}
                placeholder='Rival team'
            />
            <TextInput
                style={styles.input}
                onChange={handleDateChange}
                value={datetime}
                placeholder='Date and time'
            />

            <View style={styles.submit}>
                <Button
                    title="Add"
                    onPress={handleSubmit}
                />
            </View>
        </div>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        width: '100%',
        marginTop: 10
    },
    submit: {
        width: '100%',
        marginTop: 10
    },
    container:{
        width: '100%'
    }
});
