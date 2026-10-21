import { createContext, useContext } from 'react'
import type * as THREE from 'three'

export interface LoadedScene {
  name: string
  scene: THREE.Group
}

export interface SceneContextValue {
  loadedScenes: LoadedScene[]
  setLoadedScenes: React.Dispatch<React.SetStateAction<LoadedScene[]>>
  greenSceneMeshes: React.MutableRefObject<THREE.Mesh[]>
  treeContentMeshes: React.MutableRefObject<THREE.Mesh[]>
  workshopContentMeshes: React.MutableRefObject<THREE.Mesh[]>
  contactContentMeshes: React.MutableRefObject<THREE.Mesh[]>
  buildingsMeshes: React.MutableRefObject<THREE.Mesh[]>
  islandWorkshopMeshes: React.MutableRefObject<THREE.Mesh[]>
  islandTreeMeshes: React.MutableRefObject<THREE.Mesh[]>
  islandContactMeshes: React.MutableRefObject<THREE.Mesh[]>
  islandWorkshopOutline: React.MutableRefObject<THREE.Group | null>
  islandTreeOutline: React.MutableRefObject<THREE.Group | null>
  islandContactOutline: React.MutableRefObject<THREE.Group | null>
  navContentMeshes: React.MutableRefObject<THREE.Mesh[]>
  contactAnimationMeshes: React.MutableRefObject<THREE.Mesh[]>
  waterMeshes: React.MutableRefObject<THREE.Mesh[]>
  boatMesh: React.MutableRefObject<THREE.Mesh | null>
  treeContentsVisible: boolean
  setTreeContentsVisible: (v: boolean) => void
  currentVisibleTreeContent: number | null
  setCurrentVisibleTreeContent: (v: number | null) => void
  hoveredWorkshopContent: string | null
  setHoveredWorkshopContent: (v: string | null) => void
  loadedCameras: THREE.PerspectiveCamera[]
  setLoadedCameras: React.Dispatch<React.SetStateAction<THREE.PerspectiveCamera[]>>
  currentCameraIndex: number
  setCurrentCameraIndex: (i: number) => void
}

export const SceneContext = createContext<SceneContextValue | null>(null)

export function useScene() {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used within SceneProvider')
  return ctx
}
