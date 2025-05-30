import { Card, Divider } from "react-native-paper";
import { ScrollView, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { DisplayPlan } from "./DisplayPlan";
import { PlanProps } from "./assets";
import Modal from 'react-native-modal';

interface DisplayPlansProps {
    plans: PlanProps[];
    currentPlan: PlanProps | undefined;
    setCurrentPlan: React.Dispatch<React.SetStateAction<PlanProps | undefined>>;
    currentMode: "View" | "Add" | undefined;
    setCurrentMode: any;
}

export function DisplayPlans({ plans, currentPlan, setCurrentPlan, currentMode, setCurrentMode }: DisplayPlansProps) {

    return (
        <Modal
            isVisible={currentMode == "View"}
            animationIn="bounceInUp"
            hasBackdrop={true}
            onBackdropPress={() => setCurrentMode(undefined)}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '80%' }}>
                <Card style={{ backgroundColor: '#122637', width: '90%', padding: 20, margin: 'auto', justifyContent: 'center' }}>
                    <Card.Title
                        title="Training Plans"
                        titleStyle={{ color: 'white', fontSize: 24, textAlign: 'center', paddingVertical: 20 }}
                    />
                    <Divider style={{ margin: 10, backgroundColor: '#cdd1ce' }} />
                    <ScrollView style ={{ maxHeight: 300}}>
                        {plans.map((plan, index) => (
                            <TouchableOpacity onPress={() => setCurrentPlan(plan)} key={plan.id || index.toString()}
                                style={styles.card}
                            >
                                <Card style = {{ backgroundColor: 'transparent' }}>
                                    <Card.Title
                                        title={plan.name}
                                        subtitle={plan.description}
                                        titleStyle={styles.cardTitle}
                                        subtitleStyle={styles.cardSubtitle}
                                    />
                                </Card>
                            </TouchableOpacity>
                        ))}
                        {currentPlan && (
                            <DisplayPlan
                                plan={currentPlan}
                                setCurrentPlan={setCurrentPlan}
                            />
                        )}
                    </ScrollView>
                </Card>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 1
    },
    card: {
        margin: 10
    },
    cardTitle: {
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        paddingTop: 30,
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#cdd1ce',
        textAlign: 'center',
        paddingBottom: 30,
    },
});
