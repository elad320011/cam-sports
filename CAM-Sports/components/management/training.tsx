// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import Plan, { PlanProps } from "./trainingComponents/plan";
import axiosInstance from '@/utils/axios';
import Button from '@mui/material/Button';
import Dropdown from 'react-native-input-select';
import PlanForm from "./trainingComponents/planForm";
import { useAuth } from "@/contexts/AuthContext";
import { BACKEND_URL } from "@/globalVariables";


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
    ]
  }
];

export default function Training() {
  const { logout, user } = useAuth();
  const [plans, setPlans] = useState<PlanProps[]>([]);
  const [program, setProgram] = useState<PlanProps>();
  const [displayProgram, setDisplayProgram] = useState<any>({value: null, label: "Select a program"});
  const [addMode, setAddMode] = useState(false);

  const tempOptions = temp.map(object => ({ value: object.id, label: object.name }));

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get(`${BACKEND_URL}/training_plans/team_id/${user?.team_id}`);
        const responsePlans = JSON.parse(response.data.plans);
        setPlans(responsePlans);
      } catch (error) {
        console.log('Failed to fetch plans: ' + error);
      }
    };

    fetchPlans();
  }, [displayProgram, addMode]); // Empty dependency array means this runs once on mount

  const handleChange = (selectedOption: any) => {
    const selectedPlan = plans.find(plan => plan.id == selectedOption);
    setProgram(selectedPlan);
    console.log(selectedPlan?.name);
    setDisplayProgram(selectedOption);
  };

  return (
  <div>
    <Collapsible title="Training Programs">
      <Button style={{marginBottom: 20}} variant="outlined" onClick={(e) => setAddMode(!addMode)}>
        {addMode ? "View" : "Add"} Programs
      </Button>
      {!addMode ? (
        plans.length > 0 ? (
          <Dropdown
            label="Program"
            selectedValue={displayProgram}
            onValueChange={handleChange}
            options={plans.map(plan => ({ value: plan.id, label: plan.name }))}
            styles={styles.select}
            primaryColor={'green'}
            isMultiple={false}
            />
        ) : (
          <Dropdown
            label="Program"
            selectedValue={displayProgram}
            onValueChange={handleChange}
            options={tempOptions}
            styles={styles.select}
            primaryColor={'green'}
          />
        ))
      : (
        <PlanForm setAddMode={setAddMode} />
      )}
      {program && !addMode && <Plan {...program} />}
    </Collapsible>
    </div>
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
