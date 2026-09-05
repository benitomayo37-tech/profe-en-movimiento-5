export const physicalPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "summary",
    "objective",
    "totalMinutes",
    "sessionRpe",
    "estimatedLoad",
    "loadGuidance",
    "organizationSummary",
    "blocks",
    "hydrationGuidance",
    "safetyMeasures",
    "observableIndicators",
    "dua",
    "adaptationNotes",
    "teacherReview",
  ],
  properties: {
    title: {
      type: "string",
    },
    summary: {
      type: "string",
    },
    objective: {
      type: "string",
    },
    totalMinutes: {
      type: "integer",
      minimum: 15,
      maximum: 180,
    },
    sessionRpe: {
      type: "integer",
      minimum: 1,
      maximum: 10,
    },
    estimatedLoad: {
      type: "integer",
      minimum: 15,
      maximum: 1800,
    },
    loadGuidance: {
      type: "string",
    },
    organizationSummary: {
      type: "string",
    },
    blocks: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "objective",
          "minutes",
          "activities",
        ],
        properties: {
          name: {
            type: "string",
          },
          objective: {
            type: "string",
          },
          minutes: {
            type: "integer",
            minimum: 1,
          },
          activities: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "description",
                "series",
                "repetitions",
                "rounds",
                "workSeconds",
                "recoverySeconds",
                "transitionSeconds",
                "totalSeconds",
                "organization",
                "intensity",
                "coachingPoints",
                "safety",
              ],
              properties: {
                name: {
                  type: "string",
                },
                description: {
                  type: "string",
                },
                series: {
                  type: "integer",
                  minimum: 1,
                  maximum: 20,
                },
                repetitions: {
                  type: "string",
                },
                rounds: {
                  type: "integer",
                  minimum: 1,
                  maximum: 30,
                },
                workSeconds: {
                  type: "integer",
                  minimum: 1,
                  maximum: 3600,
                },
                recoverySeconds: {
                  type: "integer",
                  minimum: 0,
                  maximum: 1800,
                },
                transitionSeconds: {
                  type: "integer",
                  minimum: 0,
                  maximum: 1800,
                },
                totalSeconds: {
                  type: "integer",
                  minimum: 1,
                  maximum: 10800,
                },
                organization: {
                  type: "string",
                },
                intensity: {
                  type: "string",
                },
                coachingPoints: {
                  type: "array",
                  minItems: 1,
                  maxItems: 5,
                  items: {
                    type: "string",
                  },
                },
                safety: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    hydrationGuidance: {
      type: "string",
    },
    safetyMeasures: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "string",
      },
    },
    observableIndicators: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "string",
      },
    },
    dua: {
      type: "object",
      additionalProperties: false,
      required: [
        "commitment",
        "representation",
        "actionExpression",
      ],
      properties: {
        commitment: {
          type: "array",
          maxItems: 5,
          items: {
            type: "string",
          },
        },
        representation: {
          type: "array",
          maxItems: 5,
          items: {
            type: "string",
          },
        },
        actionExpression: {
          type: "array",
          maxItems: 5,
          items: {
            type: "string",
          },
        },
      },
    },
    adaptationNotes: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "string",
      },
    },
    teacherReview: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "string",
      },
    },
  },
} as const;