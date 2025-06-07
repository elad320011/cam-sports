import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axios';
import { useState } from 'react';
import { StyleSheet, Touchable, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Card, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type AddStatProps = {
    team_id: string | undefined;
    currentMode: string;
    setCurrentMode: React.Dispatch<React.SetStateAction<"View" | "Add" | undefined>>;
};

export default function AddStat(props: AddStatProps) {

    const {
        team_id,
        currentMode,
        setCurrentMode
    } = props;

    const [rivalTeam, setRivalTeam] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalReady, setModalReady] = useState(false);

    const setDate = (event: DateTimePickerEvent, date?: Date) => {
        if (date) {
            const {
              type,
              nativeEvent: {timestamp, utcOffset},
            } = event;

            setSelectedDate(date ? date.toISOString() : '');
            setShowDatePicker(false);
        }
    };

    console.log("Selected Date:", selectedDate);
    const submitStat = async () => {
        if (rivalTeam.trim() === '' || selectedDate === '') {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await axiosInstance.post('/game_statistics/create', {
                team_id: team_id,
                opposite_team_name: rivalTeam,
                game_date: selectedDate
            });

            if (response.data.game_id) {
                alert(`Successfully created a stat sheet for a game against ${rivalTeam} on ${new Date(selectedDate).toLocaleDateString()}.`);
                setRivalTeam('');
                setSelectedDate('');
                setCurrentMode("View");
                setShowDatePicker(false);
                setModalReady(false);
            } else {
                alert("Failed to add game statistics.");
            }
        } catch (error) {
            console.error("Error submitting game statistics:", error);
            alert("An error occurred while submitting the game statistics.");
        }
    }

    return (
        <Modal
            isVisible={true}
            onBackdropPress={() => {
                setSelectedDate('');
                setCurrentMode("View");
                setShowDatePicker(false);
                setModalReady(false);
            }}
            hasBackdrop={true}
            animationIn={"slideInUp"}
            onModalShow={() => {
                setModalReady(true);
            }}
        >
            <Card style={{
                backgroundColor: '#0c1c2c',
                height: 250,
                zIndex: 1
            }}>
                <Card.Title title="Add Game Statistics" titleStyle={{ color: 'white', justifyContent: 'center', alignSelf: 'center', fontSize: 24, marginTop: 30 }} />
                <Card.Content style={{
                    zIndex: 2
                }}>
                    <TextInput
                        placeholder="Rival Team Name"
                        placeholderTextColor={'#888'}
                        value={rivalTeam}
                        onChangeText={setRivalTeam}
                        style={{ margin: 20, backgroundColor: 'transparent' }}
                        textColor='white'
                    />
                    <TouchableOpacity
                        onPress={() => {
                            setShowDatePicker(true);
                        }}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="white"
                            style={{ alignSelf: 'center', margin: 0 }}
                        />
                    </TouchableOpacity>
                    {modalReady && showDatePicker && (
                        <RNDateTimePicker
                            value={new Date()}
                            onChange={setDate}
                            style={{
                                zIndex: 3
                            }}
                        />
                    )}
                    {selectedDate !== '' && (
                        <TouchableOpacity
                            onPress={() => {
                                submitStat();
                            }}
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={24}
                                color="white"
                                style={{ alignSelf: 'flex-end', margin: 20 }}
                            />
                        </TouchableOpacity>
                    )}
                </Card.Content>
            </Card>
        </Modal>
    );
}
