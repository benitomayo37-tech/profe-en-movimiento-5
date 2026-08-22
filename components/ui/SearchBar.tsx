"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Buscar recursos, cursos o herramientas...",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative w-full ${className}`}
    >
      <label htmlFor="global-search" className="sr-only">
        Buscar en Profe en Movimiento
      </label>

      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-5 pr-14 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />

      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-700 text-white transition-colors hover:bg-blue-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M16.5 16.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </form>
  );
}