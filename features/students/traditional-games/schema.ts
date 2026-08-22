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

export const studentTraditionalGamesSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "studentLevel",
    "locationLabel",
    "introduction",
    "games",
    "keyIdeas",
    "reflectionQuestion",
  ],
  properties: {
    title: shortText(5, 140),
    subtitle: shortText(5, 180),
    studentLevel: shortText(2, 100),
    locationLabel: shortText(2, 120),
    introduction: shortText(80, 650),
    games: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "location",
          "participants",
          "materials",
          "objective",
          "preparation",
          "steps",
          "rules",
          "safety",
          "inclusiveAdaptation",
          "culturalNote",
        ],
        properties: {
          name: shortText(2, 90),
          location: shortText(2, 120),
          participants: shortText(3, 100),
          materials: textList(1, 6, 90),
          objective: shortText(15, 260),
          preparation: shortText(20, 360),
          steps: textList(3, 6, 260),
          rules: textList(2, 5, 220),
          safety: textList(2, 4, 220),
          inclusiveAdaptation: shortText(20, 340),
          culturalNote: shortText(25, 420),
        },
      },
    },
    keyIdeas: textList(3, 5, 180),
    reflectionQuestion: shortText(15, 240),
  },
} as const;
