// Camera indices, in the order the cameras are defined in cameras.glb
export const CAMERA = {
  WORKSHOP: 0,
  MAIN: 1,
  CONTACT: 2,
  TREE: 3,
} as const

export const LEAF_NAMES = ['leaves1', 'leaves2', 'leaves3', 'leaves4']
export const TREE_CONTENT_NAMES = ['TreeContent1', 'TreeContent2', 'TreeContent3', 'TreeContent4']

export const BLUEPRINT_NAMES = [
  'BlueprintContent1',
  'BlueprintContent2',
  'BlueprintContent3',
  'BlueprintContent4',
]
export const BLUEPRINT_HOVER_NAMES = [...BLUEPRINT_NAMES, 'BlueprintHoverContent']

export const CONTACT_NAMES = ['ContactContent1', 'ContactContent2', 'ContactContent3', 'ContactContent4']

export const POST_SIGN_NAMES = ['PostSign1', 'PostSign2', 'PostSign3']
export const BANNER_NAMES = ['IslandBanner1', 'IslandBanner2', 'IslandBanner3']
const NAV_NAMES = [...POST_SIGN_NAMES, ...BANNER_NAMES]

// Islands reachable from the main view, indexed by the trailing digit of the sign/banner name
const ISLANDS = [
  { camera: CAMERA.WORKSHOP, outline: 'workshop' },
  { camera: CAMERA.TREE, outline: 'tree' },
  { camera: CAMERA.CONTACT, outline: 'contact' },
] as const

export type IslandOutline = (typeof ISLANDS)[number]['outline']

// 'PostSign2' / 'IslandBanner2' -> tree island
export function getNavTarget(name: string) {
  if (!NAV_NAMES.includes(name)) return undefined
  return ISLANDS[Number(name.slice(-1)) - 1]
}

export function isNavName(name: string) {
  return NAV_NAMES.includes(name)
}
