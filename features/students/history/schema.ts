export const studentHistorySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "studentLevel",
    "pages",
    "keyIdeas",
    "reflectionQuestion",
  ],
  properties: {
    title: { type: "string", minLength: 5, maxLength: 140 },
    subtitle: { type: "string", minLength: 5, maxLength: 180 },
    studentLevel: { type: "string", minLength: 2, maxLength: 100 },
    pages: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["pageNumber", "heading", "blocks"],
        properties: {
          pageNumber: { type: "integer", minimum: 1, maximum: 4 },
          heading: { type: "string", minLength: 4, maxLength: 100 },
          blocks: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "content"],
              properties: {
                title: { type: "string", minLength: 3, maxLength: 90 },
                content: { type: "string", minLength: 80, maxLength: 1100 },
              },
            },
          },
        },
      },
    },
    keyIdeas: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string", minLength: 12, maxLength: 180 },
    },
    reflectionQuestion: { type: "string", minLength: 15, maxLength: 240 },
  },
} as const;
