import type { MovementCategory } from "../types";

export const movementCategories: MovementCategory[] = [
  {
    id: "older-adults",
    title: "Adulto mayor",
    shortTitle: "Adulto mayor",
    icon: "👵",
    description:
      "Orientaciones para favorecer movilidad, fuerza, equilibrio, autonomía funcional y prevención de caídas.",
    color: "emerald",
  },
  {
    id: "chronic-diseases",
    title: "Enfermedades crónicas",
    shortTitle: "Enfermedades crónicas",
    icon: "❤️",
    description:
      "Actividad física adaptada y orientaciones educativas para personas con hipertensión, diabetes tipo 2 y obesidad.",
    color: "rose",
  },
  {
    id: "prenatal",
    title: "Actividad física durante el embarazo",
    shortTitle: "Embarazo",
    icon: "🤰",
    description:
      "Orientaciones generales para favorecer el movimiento durante el embarazo, respetando las indicaciones del equipo sanitario.",
    color: "violet",
  },
  {
    id: "reduced-mobility",
    title: "Movilidad reducida y personas encamadas",
    shortTitle: "Movilidad reducida",
    icon: "🛏️",
    description:
      "Movilidad adaptada, cuidados básicos y orientación para quienes ayudan a personas con movilidad reducida o encamadas.",
    color: "blue",
  },
];
