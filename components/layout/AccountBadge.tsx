interface AccountBadgeProps {
  authenticated: boolean;
  email?: string | null;
  fullName?: string | null;
  className?: string;
}

function getInitials(fullName?: string | null, email?: string | null) {
  const nameParts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (nameParts.length > 0) {
    return nameParts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return email?.trim().charAt(0).toUpperCase() || "PM";
}

export function AccountBadge({
  authenticated,
  email,
  fullName,
  className = "bg-orange-500",
}: AccountBadgeProps) {
  const label = authenticated
    ? fullName || email || "Cuenta docente"
    : "Visitante";

  return (
    <div
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
    >
      {authenticated ? getInitials(fullName, email) : "PM"}
    </div>
  );
}
