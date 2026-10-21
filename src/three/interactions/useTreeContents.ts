import { useCallback, useEffect, useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { useScene } from '../useScene'
import { TREE_CONTENT_NAMES } from './constants'

const HIDE_DELAY_MS = 300

function showOnly(scene: THREE.Group, visibleName: string | null) {
  for (const name of TREE_CONTENT_NAMES) {
    const obj = scene.getObjectByName(name)
    if (obj) obj.visible = name === visibleName
  }
}

// Shows one skill panel above the tree at a time; hiding is delayed so moving
// between leaves doesn't flicker. Clicking a leaf pins its panel until a click
// outside it (or Esc) closes it.
export function useTreeContents() {
  const {
    loadedScenes,
    setCurrentVisibleTreeContent,
    setTreeContentsVisible,
    treeContentPinned,
    setTreeContentPinned,
  } = useScene()
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPendingHide = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current)
      hideTimeout.current = null
    }
  }, [])

  useEffect(() => cancelPendingHide, [cancelPendingHide])

  const show = useCallback((index: number) => {
    const scene = loadedScenes.find((s) => s.name === 'treeContents-scene')?.scene
    if (!scene) return
    cancelPendingHide()
    scene.visible = true
    showOnly(scene, `TreeContent${index}`)
    setCurrentVisibleTreeContent(index)
    setTreeContentsVisible(true)
  }, [loadedScenes, cancelPendingHide, setCurrentVisibleTreeContent, setTreeContentsVisible])

  const pin = useCallback((index: number) => {
    show(index)
    setTreeContentPinned(true)
  }, [show, setTreeContentPinned])

  // Also unpins, so it closes a pinned panel too
  const hide = useCallback(() => {
    const scene = loadedScenes.find((s) => s.name === 'treeContents-scene')?.scene
    if (!scene) return
    cancelPendingHide()
    setTreeContentPinned(false)
    hideTimeout.current = setTimeout(() => {
      scene.visible = false
      showOnly(scene, null)
      setCurrentVisibleTreeContent(null)
      setTreeContentsVisible(false)
      hideTimeout.current = null
    }, HIDE_DELAY_MS)
  }, [
    loadedScenes,
    cancelPendingHide,
    setCurrentVisibleTreeContent,
    setTreeContentsVisible,
    setTreeContentPinned,
  ])

  useEffect(() => {
    if (!treeContentPinned) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [treeContentPinned, hide])

  return useMemo(
    () => ({ show, pin, hide, pinned: treeContentPinned }),
    [show, pin, hide, treeContentPinned],
  )
}
