// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import axiosInstance from '@/utils/axios';
import { useAuth } from "@/contexts/AuthContext";
import { PlanProps } from "./trainingComponents/assets";
import RNPickerSelect from 'react-native-picker-select';
import { DisplayPlan } from "./trainingComponents/DisplayPlan";
import { ButtonGroup } from "@rneui/themed";
import { AddPlan } from "./trainingComponents/AddPlan";

const temp: PlanProps[] = [
  {
    id: "test",
    name: "Hitting workout",
    description: "This plan is designed to improve your hitting skills",
    plan_sections: [
      {
        name: "Hitting lines",
        description: "Each player will hit 10 balls in a row",
        sources: [
          {
            source_type: "Image",
            source_url: "https://www.fivb.com/wp-content/uploads/2024/12/101767-1.jpeg"
          }
        ]
      },
      {
        name: "Wall hitting",
        description: "Each player will hit 10 balls against the wall, focusing on technique",
        sources: [
          {
            source_type: "Video",
            source_url: "FH0Pi7roh8E"
          }
        ]
      }
    ],
    team_id: ""
  }
];

export default function Training() {
  const { logout, user } = useAuth();
  const [plans, setPlans] = useState<PlanProps[]>([]);
  const [currentMode, setCurrentMode] = useState<"View" | "Add">("View")
  const [currentPlan, setCurrentPlan] = useState<PlanProps | undefined>(undefined);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get(`/training_plans/team_id/${user?.team_id}`);
        const responsePlans = JSON.parse(response.data.plans);
        setPlans(responsePlans);
      } catch (error) {
        console.log('Failed to fetch plans: ' + error);
      }
    };

    fetchPlans();
  }, [currentPlan, currentMode]); // Empty dependency array means this runs once on mount

  const updateCurrentPlan = (planName: string) => {
    const tempPlan = plans.find(plan => plan.name === planName);
    setCurrentPlan(tempPlan);
  }

  return (
  <>
    <Collapsible title="Training Programs">
      <ButtonGroup
        buttons={["Add", "View"]}
        selectedIndex={currentMode === "Add" ? 0 : 1}
        onPress={(index) => {
          setCurrentMode(index === 0 ? "Add" : "View");
          setCurrentPlan(undefined);
        }} />
      {currentMode === "Add" ?
        (
          <AddPlan team_id={user?.team_id} />
        )
        :
        (
          <RNPickerSelect
            onValueChange={(plan) => updateCurrentPlan(plan)}
            items={plans.map(plan => ({ label: plan.name.charAt(0).toUpperCase() + plan.name.slice(1), value: plan.name }))}
            style={{
              inputIOS: {
                marginBottom: 20,
              },
              inputAndroid: {
                marginBottom: 20,
              },
            }}
          />
        )
      }

      {currentPlan &&
        (
          <DisplayPlan plan={currentPlan} setCurrentPlan={setCurrentPlan} />
        )
      }
    </Collapsible>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    textAlign: "center"
  },
  select: {
    marginBottom: 160,
  }
});
