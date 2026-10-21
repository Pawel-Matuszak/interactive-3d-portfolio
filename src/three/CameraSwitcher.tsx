import { useScene } from './useScene'
import { NavigationBar } from '../components/NavigationBar'

const cameraNames = {
  'Project Workshop': 0,
  'Experience tree': 3,
  'Contact Me': 2,
}

export function CameraSwitcher() {
  const {
    currentCameraIndex,
    setCurrentCameraIndex,
    loadedCameras
  } = useScene()

  if (loadedCameras.length === 0) {
    return null
  }

  const cameraOptions = Object.entries(cameraNames).map(([name, index]) => ({
    name,
    index: Number(index)
  }))

  const isInCameraSelectionMode = currentCameraIndex === 1

  return (
    <>
      {!isInCameraSelectionMode && (
        <NavigationBar
          onBackClick={() => setCurrentCameraIndex(1)}
          onCameraClick={setCurrentCameraIndex}
          cameras={cameraOptions}
          currentCameraIndex={currentCameraIndex}
        />
      )}
    </>
  )
}
