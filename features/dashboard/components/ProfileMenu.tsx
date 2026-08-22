interface ProfileMenuProps {
  name?: string;
  role?: string;
  initials?: string;
}

export default function ProfileMenu({
  name = "Armando Mayo",
  role = "Docente",
  initials = "AM",
}: ProfileMenuProps) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={`Abrir perfil de ${name}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
        {initials}
      </span>

      <span className="hidden lg:block">
        <span className="block text-sm font-bold text-slate-900">
          {name}
        </span>

        <span className="block text-xs text-slate-500">
          {role}
        </span>
      </span>
    </button>
  );
}