import { useCallback } from 'react'
import { useScene } from '../useScene'

// Returns a getter for every mesh that can be hovered or clicked
export function useInteractiveMeshes() {
  const {
    greenSceneMeshes,
    treeContentMeshes,
    workshopContentMeshes,
    contactContentMeshes,
    navContentMeshes,
  } = useScene()

  return useCallback(() => [
    ...greenSceneMeshes.current,
    ...treeContentMeshes.current,
    ...workshopContentMeshes.current,
    ...contactContentMeshes.current,
    ...navContentMeshes.current,
  ], [
    greenSceneMeshes,
    treeContentMeshes,
    workshopContentMeshes,
    contactContentMeshes,
    navContentMeshes,
  ])
}
