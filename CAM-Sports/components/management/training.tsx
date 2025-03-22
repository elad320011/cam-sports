// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import Plan, { PlanProps } from "./trainingComponents/plan";
import axios from "axios";
import { useState } from "react";

export default function Training() {

  const [plans, setPlans] = useState<PlanProps[]>([]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/training_plans/team_id/your_team_id');
      const responsePlans = JSON.parse(response.data.plans);
      setPlans(responsePlans);
    } catch (error) {
      console.log('Failed to fetch plans: ' + error);
    }
  };
  fetchPlans();

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

  return (
    <Collapsible title="Training Programs">
      {plans.length > 0 && (
        plans.map((plan, index) => (
        <Collapsible title={plan.name} key={index}>
          <Plan key={index} {...plan} />
        </Collapsible>
        ))
      )}
      {plans.length === 0 && (
        temp.map((plan, index) => (
          <Collapsible title={plan.name} key={index}>
            <Plan key={index} {...plan} />
          </Collapsible>
        ))
      )}
    </Collapsible>
);
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    textAlign: "center"
  },
});
