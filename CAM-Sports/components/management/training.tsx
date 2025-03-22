// app/(tabs)/dashboard/@widgets/WidgetB.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Collapsible } from "../Collapsible";
import Plan, { PlanProps } from "./trainingComponents/plan";

export default function Training() {

  const plans: PlanProps[] = [
    {
      name: "Hitting workout",
      description: "This plan is designed to improve your hitting skills",
      plan_sections: [
        {
          name: "Hitting lines",
          description: "Each player will hit 10 balls in a row",
          sources: [
            {
              source_type: "Video",
              source_url: "997bmP4yPgU"
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
    },
    {
      name: "Plan 2",
      description: "This is the second plan",
      plan_sections: [
        {
          name: "Section 1",
          description: "This is the first section",
          sources: [
            {
              source_type: "Video",
              source_url: "qOagQWjKpyM"
            }
          ]
        }
      ]
    }
  ];

  return (
    <Collapsible title="Training Programs">
      {plans.map((plan, index) => (
        <Collapsible title={plan.name} key={index}>
          <Plan key={index} {...plan} />
        </Collapsible>
      ))}
    </Collapsible>
);
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    textAlign: "center"
  },
});
