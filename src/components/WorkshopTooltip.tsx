import { Fragment, useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useScene } from '../three/useScene'

interface WorkshopContent {
    title: string
    description: string
    link?: string
    technologies: string[]
}

const WORKSHOP_CONTENT: Record<string, WorkshopContent> = {
    BlueprintContent1: {
        title: 'Project 1',
        description: 'Coming soon - exciting project in development',
        technologies: []
    },
    BlueprintContent2: {
        title: 'Pixel Art Editor',
        description: 'A web-based pixel art creation tool with many available tools',
        technologies: ['TypeScript', 'React', 'Canvas API']
    },
    BlueprintContent3: {
        title: 'Telecom Website',
        description: 'Website for telecommunications company with modern design and responsive layout',
        technologies: ['Next.js', 'Tailwind CSS', 'TypeScript']
    },
    BlueprintContent4: {
        title: 'Chess Game',
        description: 'Interactive chess game built with vanilla JavaScript',
        technologies: ['JavaScript', 'HTML', 'CSS']
    }
}

export function WorkshopTooltip() {
    const {
        // workshopContentMeshes, // unused
        loadedScenes,
        currentCameraIndex,
        hoveredWorkshopContent
    } = useScene()

    const workshopScene = useMemo(() =>
        loadedScenes.find((s) => s.name === 'blueprintContents-scene')?.scene,
        [loadedScenes]
    )

    // Only track position and quaternion for the currently hovered object
    const [currentPos, setCurrentPos] = useState<THREE.Vector3 | null>(null)
    const [currentQuat, setCurrentQuat] = useState<THREE.Quaternion | null>(null)
    const target = useMemo(() => new THREE.Vector3(), [])
    const quat = useMemo(() => new THREE.Quaternion(), [])
    const offsetDir = useMemo(() => new THREE.Vector3(0, 1, 0), [])

    // Performance optimization - throttle position updates
    const positionUpdateThrottle = useRef(0)
    const POSITION_UPDATE_MS = 33 // ~30fps

    // Keep track of content that matches the position
    const [displayedContentKey, setDisplayedContentKey] = useState<string | null>(null)

    useFrame(() => {
        if (!workshopScene || !hoveredWorkshopContent) return

        const now = performance.now()
        if (now - positionUpdateThrottle.current < POSITION_UPDATE_MS) return
        positionUpdateThrottle.current = now

        // Only update position for the currently hovered object
        const obj = workshopScene.getObjectByName(hoveredWorkshopContent)
        if (obj) {
            obj.getWorldPosition(target)
            setCurrentPos(target.clone())
            obj.getWorldQuaternion(quat)
            setCurrentQuat(quat.clone())

            // Sync displayed content with position update
            setDisplayedContentKey(hoveredWorkshopContent)
        }
    })

    // Clear position/quaternion when hovered object changes
    useEffect(() => {
        if (!hoveredWorkshopContent) {
            setCurrentPos(null)
            setCurrentQuat(null)
            setDisplayedContentKey(null)
        }
    }, [hoveredWorkshopContent])

    // Only show tooltip when in workshop camera (index 0) and hovering over content
    if (currentCameraIndex !== 0 || !hoveredWorkshopContent || !workshopScene ||
        !currentPos || !currentQuat || displayedContentKey !== hoveredWorkshopContent) return null

    const content = WORKSHOP_CONTENT[hoveredWorkshopContent]
    if (!content) return null

    // Offset slightly above the object
    const anchoredPos = currentPos.clone().addScaledVector(offsetDir, 0.2)

    return (
        <Fragment>
            <group
                position={[anchoredPos.x, anchoredPos.y, anchoredPos.z]}
                quaternion={currentQuat}
            >
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <Html
                        transform
                        position={[0, 0.05, 0]}
                        distanceFactor={1}
                        sprite={false}
                        center
                        style={{ pointerEvents: 'none' }}
                    >
                        <div
                            className="tooltip-container"
                            style={{
                                alignItems: 'center',
                                background: 'rgba(0, 0, 0, 0.4)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.7)',
                                borderRadius: '12px',
                                padding: '6px 12px',
                                backdropFilter: 'blur(6px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                maxWidth: '320px',
                                animation: 'fadeIn 0.2s ease-out forwards'
                            }}
                        >
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                            }}>
                                {content.title}
                            </div>
                        </div>
                        <style>{`
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(4px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                    </Html>
                </group>
            </group>
        </Fragment>
    )
}
