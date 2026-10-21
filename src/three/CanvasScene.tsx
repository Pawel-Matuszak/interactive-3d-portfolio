import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { SceneProvider } from './SceneContext'
import { ModelLoader } from './ModelLoader'
import { World } from './World'
import { Interactions } from './Interactions'
import { Cameras } from './Cameras'
import { CameraSwitcher } from './CameraSwitcher'
import { WaterAnimation } from './WaterAnimation'
import { WindAnimation } from './WindAnimation'
import { GradientSky } from './GradientSky'
import { TreeContentOverlays } from '../components/TreeContentOverlays'
import { WorkshopTooltip } from '../components/WorkshopTooltip'
import { LoadingScreen } from '../components/LoadingScreen'
// import { CvButton } from '../components/CvButton'

const MOBILE_BREAKPOINT = 900

export function CanvasScene() {
  const [mobileBlocked, setMobileBlocked] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function checkMobile() {
      if (typeof window === 'undefined') return false
      const isSmall = window.innerWidth < MOBILE_BREAKPOINT || window.innerHeight < 600
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
      const shouldBlock = isSmall || isCoarsePointer
      setMobileBlocked(prev => {
        if (prev !== shouldBlock && shouldBlock) {
          setDismissed(false)
        }
        if (!shouldBlock) {
          setDismissed(false)
        }
        return shouldBlock
      })
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <SceneProvider>
        <Canvas>
          <ambientLight intensity={0.75} />
          <ModelLoader />
          <World />
          <Interactions />
          <Cameras />
          <WaterAnimation />
          <WindAnimation />
          <TreeContentOverlays />
          <WorkshopTooltip />
          {import.meta.env.DEV && (
            <>
              <Perf
                position="top-left"
                minimal={false}
                showGraph={true}
                logsPerSecond={2}
                deepAnalyze={false}
              />
            </>
          )}
          {/* <OrbitControls enableDamping makeDefault /> */}
          {/* <Environment preset="park" background /> */}
          <GradientSky />
        </Canvas>
        <LoadingScreen />
        <CameraSwitcher />
        {/* <CvButton /> */}
      </SceneProvider>
      {mobileBlocked && !dismissed && (
        <div className="mobile-blocker">
          <div className="mobile-blocker__card">
            <div className="mobile-blocker__title">Best experienced on desktop</div>
            <div className="mobile-blocker__body">
              This interactive 3D portfolio needs a keyboard, mouse, and a larger screen
              to run smoothly.
              Please visit again on a laptop or desktop for the full experience.
            </div>
            <button
              type="button"
              className="mobile-blocker__dismiss"
              onClick={() => setDismissed(true)}
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

