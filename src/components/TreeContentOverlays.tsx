import { Fragment, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../three/useScene'

interface TreeOverlayContent {
  title: string
  description: string
  imageUrl?: string
  skills: string[]
}
const BASE_URL = import.meta.env.BASE_URL
const SKILLS_LIST = new Map<string, string>(
  [
    ['Python', `${BASE_URL}static/icons/python.png`],
    ['TypeScript', `${BASE_URL}static/icons/typescript.png`],
    ['React', `${BASE_URL}static/icons/react.png`],
    ['AI', `${BASE_URL}static/icons/science.png`],
    ['REST API', `${BASE_URL}static/icons/api.png`],
    ['Next.js', `${BASE_URL}static/icons/nextjs.png`],
  ]
)

const SKILL_POSITIONS: Record<number, { x: number; y: number }[]> = {
  4: [
    { x: -200, y: 0 },
    { x: -100, y: 45 },
    { x: 10, y: 55 },
    { x: 120, y: 40 }
  ],
  3: [
    { x: 220, y: 5 },
    { x: 99, y: 40 },
    { x: -10, y: 50 },
    { x: -110, y: 15 }
  ],
  2: [
    { x: -180, y: 15 },
    { x: -60, y: 30 },
    { x: 50, y: 40 },
    { x: 150, y: 20 }
  ],
  1: [
    { x: 135, y: 20 },
    { x: 30, y: 40 },
    { x: -80, y: 20 },
    { x: -190, y: 40 }
  ]
}

const VIEWPORT_MARGIN = 16
// Re-check after the panel has been positioned and after its appear animation finishes
const CLAMP_DELAYS_MS = [50, 450]

// Shift the panel (and its skill icons) so nothing sticks out of the window
function clampToViewport(el: HTMLElement) {
  el.style.transform = ''
  const scale = el.getBoundingClientRect().width / el.offsetWidth
  if (!scale) return

  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity
  for (const child of el.querySelectorAll('*')) {
    const rect = child.getBoundingClientRect()
    if (!rect.width) continue
    left = Math.min(left, rect.left)
    right = Math.max(right, rect.right)
    top = Math.min(top, rect.top)
    bottom = Math.max(bottom, rect.bottom)
  }

  const shift = (min: number, max: number, size: number) => {
    if (min < VIEWPORT_MARGIN) return VIEWPORT_MARGIN - min
    // Prefer keeping the start edge visible when the panel is wider than the window
    const overflow = size - VIEWPORT_MARGIN - max
    if (overflow < 0) return Math.max(overflow, VIEWPORT_MARGIN - min)
    return 0
  }
  const dx = shift(left, right, window.innerWidth) / scale
  const dy = shift(top, bottom, window.innerHeight) / scale
  if (dx || dy) el.style.transform = `translate(${dx}px, ${dy}px)`
}

const DEFAULT_CONTENT: Record<number, TreeOverlayContent> = {
  4: {
    title: 'RTB House – TypeScript Developer',
    description: 'Developed an internal AI chat assistant to support daily tasks. Built tracking scripts, crawlers, and reporting scripts.',
    skills: [
      SKILLS_LIST.get('Python') ?? '',
      SKILLS_LIST.get('TypeScript') ?? '',
      SKILLS_LIST.get('AI') ?? '',
    ]
  },
  3: {
    title: 'Anfata Games – Full Stack Developer',
    description: 'Enhanced application performance and fixed critical bugs improving overall code stability. Integrated dynamic user content from a headless CMS.',
    skills: [
      SKILLS_LIST.get('Next.js') ?? '',
      SKILLS_LIST.get('TypeScript') ?? '',
      SKILLS_LIST.get('React') ?? '',
    ]
  },
  2: {
    title: 'CeboTech – Python Developer',
    description: 'Contributed to AI-driven applications. REST API design. Domain-driven architecture. Developed app features to improve small business finance management.',
    skills: [
      SKILLS_LIST.get('Python') ?? '',
      SKILLS_LIST.get('AI') ?? '',
      SKILLS_LIST.get('REST API') ?? '',
      SKILLS_LIST.get('React') ?? '',
    ]
  },
  1: {
    title: 'Storm Gray Unit – Junior Frontend Developer',
    description: 'Developed React-based admin dashboards for IoT management. Collaborated on REST API design to ensure seamless data flow.',
    skills: [
      SKILLS_LIST.get('React') ?? '',
      SKILLS_LIST.get('REST API') ?? '',
    ]
  }
}

export function TreeContentOverlays({
  contents = DEFAULT_CONTENT,
}: {
  contents?: Record<number, TreeOverlayContent>
}) {
  const { loadedScenes, treeContentsVisible, currentVisibleTreeContent } = useScene()

  const treeScene = useMemo(() => loadedScenes.find((s) => s.name === 'treeContents-scene')?.scene, [loadedScenes])

  const positions = useMemo(() => new Map<number, THREE.Vector3>(), [])
  const quaternions = useMemo(() => new Map<number, THREE.Quaternion>(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const forward = useMemo(() => new THREE.Vector3(0, 0, 1), [])

  // Performance optimization - throttle position updates
  const positionUpdateThrottle = useRef(0)
  const clampRef = useRef<HTMLDivElement>(null)
  const POSITION_UPDATE_MS = 33 // ~30fps

  // Get fixed positions for skills
  const skillPositions = useMemo(() => {
    if (currentVisibleTreeContent && SKILL_POSITIONS[currentVisibleTreeContent]) {
      return SKILL_POSITIONS[currentVisibleTreeContent]
    }
    return []
  }, [currentVisibleTreeContent])

  // Preload all skill images to avoid flashing when switching indices
  useEffect(() => {
    const urls = new Set<string>()
    Object.values(contents).forEach((c) => {
      c.skills.forEach((u) => {
        if (u && !urls.has(u)) {
          urls.add(u)
          const img = new Image()
          img.src = u
        }
      })
    })
  }, [contents])

  useEffect(() => {
    if (!treeContentsVisible || !currentVisibleTreeContent) return
    const clamp = () => {
      if (clampRef.current) clampToViewport(clampRef.current)
    }
    const timeouts = CLAMP_DELAYS_MS.map((ms) => setTimeout(clamp, ms))
    window.addEventListener('resize', clamp)
    return () => {
      timeouts.forEach(clearTimeout)
      window.removeEventListener('resize', clamp)
    }
  }, [treeContentsVisible, currentVisibleTreeContent])

  useFrame(() => {
    if (!treeScene) return

    const now = performance.now()
    if (now - positionUpdateThrottle.current < POSITION_UPDATE_MS) return
    positionUpdateThrottle.current = now

    for (let i = 1; i <= 4; i++) {
      const obj = treeScene.getObjectByName(`TreeContent${i}`)
      if (obj) {
        obj.getWorldPosition(target)
        positions.set(i, target.clone())
        obj.getWorldQuaternion(quat)
        quaternions.set(i, quat.clone())
      }
    }
  })

  if (!treeScene || !treeContentsVisible || !currentVisibleTreeContent) return null

  const index = currentVisibleTreeContent
  const pos = positions.get(index)
  const q = quaternions.get(index)
  const content = contents[index]

  if (!pos || !q || !content) return null

  // Offset slightly along the object's forward to avoid coincident plane
  const offsetDir = forward.clone().applyQuaternion(q)
  const anchoredPos = pos.clone().addScaledVector(offsetDir, 0.06)

  return (
    <Fragment>
      <group key={`tree-overlay-${index}`} position={[anchoredPos.x, anchoredPos.y, anchoredPos.z]} quaternion={q}>
        <group rotation={[Math.PI / 2, -Math.PI, -Math.PI / 2]}>
          <Html
            key={`tree-html-${index}`}
            transform
            position={[0, 0, 0]}
            distanceFactor={6}
            sprite={false}
            center
            style={{ pointerEvents: 'none' }}
          >
            <style>{`
              @keyframes treeContentAppear {
                from {
                  opacity: 0;
                  transform: scale(0.9) translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
            `}</style>
            <div ref={clampRef}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.7)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  maxWidth: '320px',
                  animation: 'treeContentAppear 0.25s ease-out forwards',
                  animationDelay: '50ms',
                  opacity: 0
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
                    {content.title}
                  </div>
                  <ul style={{ textAlign: 'left', marginBottom: 0 }}>
                    {content.description.split('. ').map(item => (
                      <li
                        key={item}
                        style={{ fontSize: 18, opacity: 0.9, listStyleType: 'disc', marginBottom: 4 }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Skills with fixed positioning and curved lines */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '160px',
                marginTop: '10px',
                animation: 'treeContentAppear 0.25s ease-out forwards',
                animationDelay: '150ms',
                opacity: 0
              }}>
                {/* SVG for curved lines */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  {content.skills.map((_, skillIndex) => {
                    if (skillPositions.length <= skillIndex) return null
                    const skillPos = skillPositions[skillIndex]
                    const startX = 160 // Center of the main content
                    const startY = 0
                    const endX = skillPos.x + 160
                    const endY = skillPos.y + 41 // Half of skill image height

                    // Create a curved path
                    const controlX = (startX + endX) / 2
                    const controlY = Math.min(startY, endY) - 30 // Curve upward

                    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`

                    return (
                      <path
                        key={`line-${skillIndex}`}
                        d={pathData}
                        stroke="rgba(255, 255, 255, 0.6)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    )
                  })}
                </svg>

                {/* Skills positioned randomly */}
                {content.skills.map((skillUrl, skillIndex) => {
                  if (skillPositions.length <= skillIndex) return null
                  const skillPos = skillPositions[skillIndex]

                  return (
                    <div
                      key={`skill-${skillIndex}-${skillUrl}`}
                      style={{
                        position: 'absolute',
                        left: `${skillPos.x + 160 - 41}px`, // Center the image
                        top: `${skillPos.y}px`,
                        zIndex: 2,
                        background: 'rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <img
                        src={skillUrl}
                        alt={`Skill ${skillIndex + 1}`}
                        style={{
                          width: 82,
                          height: 82,
                          borderRadius: 8,
                          border: '2px solid rgba(255, 255, 255, 0.8)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(4px)',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </Html>
        </group>
      </group>
    </Fragment >
  )
}

export default TreeContentOverlays


