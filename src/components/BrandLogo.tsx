import type { SVGProps } from 'react'

interface BrandLogoProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Faceted Prism Logo Mark (Option 5)
 * An isometric diamond/crystal whose center facet glows with the brand/emerald color,
 * surrounded by structured geometric facets.
 */
export function BrandLogo({ size = 28, className = '', ...props }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Top crown facet */}
      <polygon
        points="16,3 26,9 6,9"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left upper facet */}
      <polygon
        points="6,9 13,13 6,15"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right upper facet */}
      <polygon
        points="26,9 26,15 19,13"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left lower facet */}
      <polygon
        points="6,15 13,13 14,24 16,29"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right lower facet */}
      <polygon
        points="26,15 16,29 18,24 19,13"
        fill="currentColor"
        fillOpacity="0.36"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Glowing Center Emerald Core Facet */}
      <polygon
        points="16,9 19,13 18,24 16,29 14,24 13,13"
        fill="var(--color-brand)"
        stroke="var(--color-brand)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Subtle reflection highlight */}
      <polygon
        points="16,10 18,13 17,23 16,26"
        fill="#ffffff"
        fillOpacity="0.35"
      />
    </svg>
  )
}
