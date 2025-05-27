import { useState } from 'react';
import { PlanProps, plan_sections } from "./assets";
import { ScrollView, Text } from "react-native";

export function AddPlan(props: any) {

    const team_id = props.team_id;
    const [plan, setPlan] = useState<PlanProps>({
        id: "",
        name: "",
        description: "",
        plan_sections: [],
        team_id: team_id
    });
    const [sections, setSections] = useState<plan_sections[]>();

    return (
        <ScrollView style={{ flex: 1, padding: 10, width: '100%', height: '100%' }}>

        </ScrollView>
    );
}
