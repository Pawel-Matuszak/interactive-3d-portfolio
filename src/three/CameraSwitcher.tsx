import { useScene } from './useScene'
import { NavigationBar } from '../components/NavigationBar'
import { CAMERA } from './interactions/constants'

const NAV_ITEMS = [
  { name: 'Home', index: CAMERA.MAIN },
  { name: 'Workshop', index: CAMERA.WORKSHOP },
  { name: 'Experience', index: CAMERA.TREE },
  { name: 'Contact', index: CAMERA.CONTACT },
]

export function CameraSwitcher() {
  const {
    currentCameraIndex,
    setCurrentCameraIndex,
    loadedCameras,
    isCameraFlying,
    introDone,
  } = useScene()

  return (
    <NavigationBar
      visible={loadedCameras.length > 0 && introDone}
      disabled={isCameraFlying}
      items={NAV_ITEMS}
      currentCameraIndex={currentCameraIndex}
      onNavigate={setCurrentCameraIndex}
    />
  )
}
