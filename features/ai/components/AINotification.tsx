interface AINotificationProps {
  message: string;
}

export default function AINotification({
  message,
}: AINotificationProps) {
  return (
    <p
      aria-live="polite"
      className={`mt-5 min-h-6 text-center text-sm font-semibold ${
        message ? "text-emerald-700" : "text-transparent"
      }`}
    >
      {message || "Sin notificaciones"}
    </p>
  );
}
