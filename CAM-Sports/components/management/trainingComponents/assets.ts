export type sources = {
    source_type: string;
    source_url: string;
};

export type plan_sections = {
    name: string;
    description: string;
    sources: sources[];
};

export type PlanProps = {
    id: string;
    name: string;
    plan_sections: plan_sections[];
    description: string;
    team_id: string; // Add team_id to props for the delete request
};
