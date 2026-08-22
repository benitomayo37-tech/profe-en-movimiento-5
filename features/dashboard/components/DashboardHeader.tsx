import SearchBar from "@/components/ui/SearchBar";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

export default function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-20 items-center gap-4 px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-950">
            Dashboard
          </h1>

          <p className="truncate text-sm text-slate-500">
            Centro de operaciones del docente
          </p>
        </div>

        <div className="hidden w-full max-w-md md:block">
          <SearchBar />
        </div>

       <NotificationBell />

        <ProfileMenu />
      </div>

      <div className="border-t border-slate-100 px-6 py-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}