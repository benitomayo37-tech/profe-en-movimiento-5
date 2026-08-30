export type CommunityKind = "topic" | "experience" | "question" | "improvement";
export type CommunityStatus = "pending" | "reviewing" | "resolved" | "archived";

export interface CommunitySubmission {
  id: string;
  user_id: string;
  kind: CommunityKind;
  subject: string;
  message: string;
  status: CommunityStatus;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export const communityKinds: Record<CommunityKind, { label: string; icon: string; description: string }> = {
  topic: { label: "Sugerir un tema", icon: "💡", description: "Propón un contenido que te gustaría encontrar en la plataforma." },
  experience: { label: "Compartir una experiencia", icon: "📝", description: "Cuéntanos una práctica o aprendizaje que pueda orientar nuestro trabajo." },
  question: { label: "Enviar una pregunta", icon: "❓", description: "Comparte una duda que la comunidad educativa necesita resolver." },
  improvement: { label: "Proponer una mejora", icon: "❤️", description: "Ayúdanos a hacer Profe en Movimiento más útil y accesible." },
};

