"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Container from "../ui/Container";
import SearchBar from "../ui/SearchBar";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Recursos", href: "/resources" },
  { name: "IA Educativa", href: "/ai" },
  { name: "Tienda", href: "/store" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function closeAllPanels() {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <Container>
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* LOGOTIPO */}
          <Link
            href="/"
            onClick={closeAllPanels}
            className="flex shrink-0 items-center gap-3"
            aria-label="Ir a la página principal"
          >
            <Image
              src="/logos/logo-profe-en-movimiento.png"
              alt="Logo de Profe en Movimiento"
              width={62}
              height={62}
              priority
              className="h-14 w-14 object-contain"
            />

            <div className="hidden sm:block">
              <p className="text-lg font-black leading-none text-blue-800">
                Profe en Movimiento
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                Plataforma educativa
              </p>
            </div>
          </Link>

          {/* NAVEGACIÓN DE ESCRITORIO */}
          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Navegación principal"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition-colors duration-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* ACCIONES DE ESCRITORIO */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setIsSearchOpen((currentState) => !currentState)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100"
              aria-label={
                isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"
              }
              aria-expanded={isSearchOpen}
              aria-controls="desktop-search-panel"
            >
              {isSearchOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
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
              )}
            </button>

            <Link
              href="/login"
              className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Crear cuenta
            </Link>
          </div>

          {/* BOTÓN DEL MENÚ MÓVIL */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((currentState) => !currentState);
              setIsSearchOpen(false);
            }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* BÚSQUEDA DE ESCRITORIO */}
        {isSearchOpen && (
          <div
            id="desktop-search-panel"
            className="hidden border-t border-slate-200 py-4 lg:block"
          >
            <SearchBar className="mx-auto max-w-3xl" />
          </div>
        )}

        {/* MENÚ MÓVIL */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 py-5 lg:hidden"
          >
            <SearchBar />

            <nav
              className="mt-5 flex flex-col gap-2"
              aria-label="Navegación móvil"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><ThemeSwitcher mobile /></div>
              <Link
                href="/login"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
