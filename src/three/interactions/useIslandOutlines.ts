import { useCallback, useMemo } from 'react'
import { useScene } from '../useScene'
import type { IslandOutline } from './constants'
import { setOutlineVisible } from './meshUtils'

export function useIslandOutlines() {
  const { islandWorkshopOutline, islandTreeOutline, islandContactOutline } = useScene()

  const show = useCallback((island: IslandOutline) => {
    const outlines = {
      workshop: islandWorkshopOutline,
      tree: islandTreeOutline,
      contact: islandContactOutline,
    }
    setOutlineVisible(outlines[island].current, true)
  }, [islandWorkshopOutline, islandTreeOutline, islandContactOutline])

  const hideAll = useCallback(() => {
    for (const outline of [islandWorkshopOutline, islandTreeOutline, islandContactOutline]) {
      setOutlineVisible(outline.current, false)
    }
  }, [islandWorkshopOutline, islandTreeOutline, islandContactOutline])

  return useMemo(() => ({ show, hideAll }), [show, hideAll])
}
