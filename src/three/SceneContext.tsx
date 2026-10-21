import { useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import { SceneContext, type LoadedScene, type SceneContextValue } from './useScene'

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [loadedScenes, setLoadedScenes] = useState<LoadedScene[]>([])
  const [loadedCameras, setLoadedCameras] = useState<THREE.PerspectiveCamera[]>([])
  //0 - workshop
  //1 - main
  //2 - about
  //3 - three
  const [currentCameraIndex, setCurrentCameraIndex] = useState(1)
  const contactAnimationMeshes = useRef<THREE.Mesh[]>([])
  const [treeContentsVisible, setTreeContentsVisible] = useState(false)
  const [currentVisibleTreeContent, setCurrentVisibleTreeContent] = useState<number | null>(null)
  const [hoveredWorkshopContent, setHoveredWorkshopContent] = useState<string | null>(null)

  const greenSceneMeshes = useRef<THREE.Mesh[]>([])
  const treeContentMeshes = useRef<THREE.Mesh[]>([])
  const workshopContentMeshes = useRef<THREE.Mesh[]>([])
  const contactContentMeshes = useRef<THREE.Mesh[]>([])
  const buildingsMeshes = useRef<THREE.Mesh[]>([])
  const islandWorkshopMeshes = useRef<THREE.Mesh[]>([])
  const islandTreeMeshes = useRef<THREE.Mesh[]>([])
  const islandContactMeshes = useRef<THREE.Mesh[]>([])
  const islandWorkshopOutline = useRef<THREE.Group | null>(null)
  const islandTreeOutline = useRef<THREE.Group | null>(null)
  const islandContactOutline = useRef<THREE.Group | null>(null)
  const navContentMeshes = useRef<THREE.Mesh[]>([])
  const waterMeshes = useRef<THREE.Mesh[]>([])
  const boatMesh = useRef<THREE.Mesh | null>(null)

  const value: SceneContextValue = useMemo(() => ({
    loadedScenes,
    setLoadedScenes,
    greenSceneMeshes,
    treeContentMeshes,
    workshopContentMeshes,
    contactContentMeshes,
    buildingsMeshes,
    islandWorkshopMeshes,
    islandTreeMeshes,
    islandContactMeshes,
    islandWorkshopOutline,
    islandTreeOutline,
    islandContactOutline,
    navContentMeshes,
    contactAnimationMeshes,
    waterMeshes,
    boatMesh,
    treeContentsVisible,
    setTreeContentsVisible,
    currentVisibleTreeContent,
    setCurrentVisibleTreeContent,
    hoveredWorkshopContent,
    setHoveredWorkshopContent,
    loadedCameras,
    setLoadedCameras,
    currentCameraIndex,
    setCurrentCameraIndex
  }), [
    loadedScenes,
    contactAnimationMeshes,
    treeContentsVisible,
    currentVisibleTreeContent,
    hoveredWorkshopContent,
    loadedCameras,
    currentCameraIndex,
    contactContentMeshes,
    buildingsMeshes,
    islandWorkshopMeshes,
    islandTreeMeshes,
    islandContactMeshes,
    navContentMeshes
  ])

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}
