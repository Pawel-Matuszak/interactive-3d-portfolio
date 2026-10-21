import { useCameraEnterEffects } from './interactions/useCameraEnterEffects'
import { useClickHandler } from './interactions/useClickHandler'
import { useHoverEffects } from './interactions/useHoverEffects'
import { useIslandOutlines } from './interactions/useIslandOutlines'
import { usePointer } from './interactions/usePointer'
import { useTreeContents } from './interactions/useTreeContents'

export function Interactions() {
  const pointer = usePointer()
  const treeContents = useTreeContents()
  const outlines = useIslandOutlines()

  useCameraEnterEffects(treeContents.hide, outlines.hideAll)
  useClickHandler(pointer, treeContents.hide)
  useHoverEffects(pointer, treeContents, outlines)

  return null
}
