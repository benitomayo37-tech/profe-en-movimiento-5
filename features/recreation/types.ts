export type RecreationActivityType =
  | "juego"
  | "yincana"
  | "escape-room"
  | "reto"
  | "integracion"
  | "tradicional";

export interface RecreationActivityDraft {
  title: string;
  type: RecreationActivityType;
  objective: string;
  level: string;
  duration: string;
  participants: string;
  space: string;
  materials: string;
  instructions: string;
  adaptations: string;
  safety: string;
}

export const recreationActivityTypes: Array<{
  value: RecreationActivityType;
  label: string;
  description: string;
}> = [
  { value: "juego", label: "Juegos recreativos", description: "Actividades l\u00fadicas y participativas." },
  { value: "yincana", label: "Yincanas", description: "Retos por estaciones, pistas o recorridos." },
  { value: "escape-room", label: "Escape rooms", description: "Misi\u00f3n narrativa con pistas y soluci\u00f3n final." },
  { value: "reto", label: "Retos activos", description: "Desaf\u00edos motrices, creativos o cooperativos." },
  { value: "integracion", label: "Integraci\u00f3n", description: "Dinamicas de confianza y convivencia." },
  { value: "tradicional", label: "Juegos tradicionales", description: "Propuestas culturales adaptables." },
];

export const emptyRecreationActivity: RecreationActivityDraft = {
  title: "",
  type: "juego",
  objective: "",
  level: "",
  duration: "",
  participants: "",
  space: "",
  materials: "",
  instructions: "",
  adaptations: "",
  safety: "",
};
export interface RecreationActivityRecord extends RecreationActivityDraft {
  id: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}