import type { SVGProps } from "react";

/**
 * Aproximação do ícone da marca Kev (losango/"olho") até termos o vetor real
 * exportado de `Identidade visual Kev/Logo/KEV_LOGOS_FINAIS_V02.ai` para SVG.
 */
export function KevMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13 8 L5 16 L13 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 8 L27 16 L19 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}
