const shortText = (minimum: number, maximum: number) => ({
  type: "string",
  minLength: minimum,
  maxLength: maximum,
} as const);

const textList = (minimum: number, maximum: number, itemMaximum: number) => ({
  type: "array",
  minItems: minimum,
  maxItems: maximum,
  items: shortText(3, itemMaximum),
} as const);

export const studentSportsSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "studentLevel",
    "detectedFocus",
    "introduction",
    "pages",
    "glossary",
    "keyIdeas",
    "reflectionQuestion",
  ],
  properties: {
    title: shortText(5, 140),
    subtitle: shortText(5, 180),
    studentLevel: shortText(2, 100),
    detectedFocus: shortText(3, 90),
    introduction: shortText(80, 500),
    pages: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["pageNumber", "heading", "blocks"],
        properties: {
          pageNumber: { type: "integer", minimum: 1, maximum: 3 },
          heading: shortText(4, 100),
          blocks: {
            type: "array",
            minItems: 2,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "content", "points"],
              properties: {
                title: shortText(3, 90),
                content: shortText(80, 650),
                points: textList(2, 5, 180),
              },
            },
          },
        },
      },
    },
    glossary: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "definition"],
        properties: {
          term: shortText(2, 50),
          definition: shortText(12, 160),
        },
      },
    },
    keyIdeas: textList(3, 5, 180),
    reflectionQuestion: shortText(15, 240),
  },
} as const;
