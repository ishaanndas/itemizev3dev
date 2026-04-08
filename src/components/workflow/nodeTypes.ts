export const NODE_TYPES_CONFIG = {
  trigger: {
    label: "Trigger",
    description: "Entry point that starts the workflow",
    color: "hsl(var(--primary))",
    bgColor: "hsl(var(--primary) / 0.08)",
    borderColor: "hsl(var(--primary) / 0.25)",
  },
  step: {
    label: "Step",
    description: "Approval, action, or workflow endpoint",
    color: "hsl(142 71% 45%)",
    bgColor: "hsl(142 71% 45% / 0.08)",
    borderColor: "hsl(142 71% 45% / 0.25)",
  },
  condition: {
    label: "Condition",
    description: "Branch based on rules",
    color: "hsl(38 92% 50%)",
    bgColor: "hsl(38 92% 50% / 0.08)",
    borderColor: "hsl(38 92% 50% / 0.25)",
  },
} as const;

export type WorkflowNodeType = keyof typeof NODE_TYPES_CONFIG;
