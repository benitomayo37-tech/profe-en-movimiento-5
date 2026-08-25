export type MovementLibraryResource = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "available" | "coming-soon";
  href?: string;
};

export const movementLibraryResources: MovementLibraryResource[] = [
  {
    id: "printable-sheets",
    title: "Fichas imprimibles",
    description:
      "Material educativo preparado para consultar, imprimir y utilizar como apoyo.",
    icon: "📄",
    status: "coming-soon",
  },
  {
    id: "safety-checklists",
    title: "Checklists de seguridad",
    description:
      "Listas rápidas para preparar el entorno y acompañar actividades de forma organizada.",
    icon: "🧾",
    status: "coming-soon",
  },
  {
    id: "educational-guides",
    title: "Guías educativas",
    description:
      "Orientaciones generales sobre movimiento, actividad física adaptada y autonomía.",
    icon: "🧠",
    status: "coming-soon",
  },
  {
    id: "infographics",
    title: "Infografías",
    description:
      "Recursos visuales para comprender y recordar recomendaciones de forma sencilla.",
    icon: "🖼️",
    status: "coming-soon",
  },
  {
    id: "educational-videos",
    title: "Videos educativos",
    description:
      "Espacio destinado a videos y demostraciones educativas cuidadosamente seleccionadas.",
    icon: "🎥",
    status: "coming-soon",
  },
  {
    id: "caregiver-resources",
    title: "Recursos para cuidadores",
    description:
      "Material de apoyo para familiares y cuidadores de personas con movilidad reducida.",
    icon: "🧑‍🦽",
    status: "coming-soon",
  },
];