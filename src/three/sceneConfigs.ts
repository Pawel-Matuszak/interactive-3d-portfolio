import * as THREE from 'three'

export interface SceneConfig {
  name: string
  sceneUrl: string
  textureUrl?: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  textureSettings: Partial<{
    flipY: boolean
    colorSpace: THREE.ColorSpace
    minFilter: THREE.TextureFilter
    magFilter: THREE.TextureFilter
    wrapS: THREE.Wrapping
    wrapT: THREE.Wrapping
  }>
}

const BASE_URL = import.meta.env.BASE_URL

// Assets are expected under public/static/
export const sceneConfigs: SceneConfig[] = [
  {
    name: 'islands-scene',
    sceneUrl: `${BASE_URL}static/islands.glb`,
    textureUrl: `${BASE_URL}static/islands.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping
    }
  },
  {
    name: 'buildings-scene',
    sceneUrl: `${BASE_URL}static/buildings.glb`,
    textureUrl: `${BASE_URL}static/buildings.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'bushRocks-scene',
    sceneUrl: `${BASE_URL}static/nature.glb`,
    textureUrl: `${BASE_URL}static/nature.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'small-scene',
    sceneUrl: `${BASE_URL}static/small.glb`,
    textureUrl: `${BASE_URL}static/small.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'water-scene',
      sceneUrl: `${BASE_URL}static/water.glb`,
    textureUrl: `${BASE_URL}static/water.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'contactContents-scene',
    sceneUrl: `${BASE_URL}static/contactContents.glb`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'blueprintContents-scene',
    sceneUrl: `${BASE_URL}static/blueprintContents.glb`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'treeContents-scene',
    sceneUrl: `${BASE_URL}static/treeContents.glb`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'island-hover',
    sceneUrl: `${BASE_URL}static/islandHover.glb`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'clouds-scene',
    sceneUrl: `${BASE_URL}static/clouds.glb`,
    textureUrl: `${BASE_URL}static/clouds.png`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    }
  },
  {
    name: 'islandNavigation-scene',
    sceneUrl: `${BASE_URL}static/islandNavigation.glb`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    textureSettings: {
      flipY: false,
      colorSpace: THREE.SRGBColorSpace,
    }
  }
]

export const CAMERAS_GLTF_URL = `${BASE_URL}static/cameras.glb`
export const DRACO_DECODER_PATH = `${BASE_URL}static/draco/`
export const CONTACT_LINKS = {
  ContactContent1: 'https://github.com/Pawel-Matuszak',
  ContactContent2: 'https://www.linkedin.com/in/pawe%C5%82-matuszak-404a5523b/',
  ContactContent4: 'mailto:pawel.matuszak2@icloud.com',
}
export const BLUEPRINT_LINKS = {
  // BlueprintContent1: 'https://example.com/project-1',
  BlueprintContent2: 'https://pixel-art-editor-xi.vercel.app/',
  BlueprintContent4: 'https://pawel-matuszak.github.io/chess-js/',
  BlueprintContent3: 'https://www.a-tel.com.pl/',
}
