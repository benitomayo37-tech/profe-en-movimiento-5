interface NotificationBellProps {
  hasNotifications?: boolean;
  count?: number;
}

export default function NotificationBell({
  hasNotifications = false,
  count,
}: NotificationBellProps) {
  const showCount =
    hasNotifications &&
    typeof count === "number" &&
    count > 0;

  return (
    <button
      type="button"
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={
        hasNotifications
          ? "Ver notificaciones pendientes"
          : "Ver notificaciones"
      }
    >
      <span aria-hidden="true">🔔</span>

      {hasNotifications && (
        <span
          className="absolute right-2 top-2 flex min-h-2 min-w-2 items-center justify-center rounded-full bg-red-500"
          aria-hidden="true"
        >
          {showCount && (
            <span className="absolute -right-3 -top-3 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {count! > 99 ? "99+" : count}
            </span>
          )}
        </span>
      )}
    </button>
  );
}