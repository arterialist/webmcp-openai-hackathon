/**
 * The page behavior lives in App and the WebMCP/Realtime layers. This tiny
 * adapter is the deliberate seam for swapping visual systems without
 * changing those contracts.
 */
export type PresentationVariant = 'modern' | 'editorial'

export const activePresentation: PresentationVariant = 'modern'

export function presentationClassName(variant: PresentationVariant = activePresentation) {
  return `ui-${variant}`
}
