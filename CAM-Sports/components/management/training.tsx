// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Collapsible } from "../Collapsible";
import axiosInstance from '@/utils/axios';
import { useAuth } from "@/contexts/AuthContext";
import { PlanProps } from "./trainingComponents/assets";
import { ButtonGroup } from "@rneui/themed";
import { AddPlan } from "./trainingComponents/AddPlan";
import { DisplayPlans } from "./trainingComponents/DisplayPlans";
import { Ionicons } from "@expo/vector-icons";

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
  const [currentMode, setCurrentMode] = useState<"View" | "Add" | undefined>(undefined)
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
    <Collapsible title="Training Programs" keepShut={true} training={true} setCurrentMode={setCurrentMode} setCurrentPlan={setCurrentPlan}>

      <View style={styles.buttonsView}>
        <Ionicons
          name="add-outline"
          size={24}
          color="white"
          onPress={() => {
            setCurrentMode("Add");
            setCurrentPlan(undefined);
          }}
          style={{ marginRight: 20 }}
        />
        <Ionicons
          name="eye-outline"
          size={24}
          color="white"
          onPress={() => {
            setCurrentMode("View");
            setCurrentPlan(undefined);
          }}
          style={{ marginLeft: 20 }}
        />
      </View>

      <DisplayPlans plans={plans} currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} currentMode={currentMode} setCurrentMode={setCurrentMode} />
      <AddPlan team_id={user?.team_id} currentMode={currentMode} setCurrentMode={setCurrentMode} />
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
  },
  buttonsView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
},
});
