import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScene } from '../three/useScene'
import { CAMERA } from '../three/interactions/constants'

const HINT_DURATION_MS = 6000

// One-time hint shown when the intro lands on the signpost
export function IntroHint() {
  const { introDone, currentCameraIndex } = useScene()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!introDone || dismissed) return
    if (currentCameraIndex !== CAMERA.MAIN) {
      setDismissed(true)
      return
    }
    const t = setTimeout(() => setDismissed(true), HINT_DURATION_MS)
    return () => clearTimeout(t)
  }, [introDone, dismissed, currentCameraIndex])

  const visible = introDone && !dismissed && currentCameraIndex === CAMERA.MAIN

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-hint"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Pick an island to explore.
        </motion.div>
      )}
    </AnimatePresence>
  )
}
