import { Fragment } from 'react'
import { useScene } from './useScene'

export function World() {
  const { loadedScenes } = useScene()
  return (
    <Fragment>
      {loadedScenes.map(({ name, scene }) => (
        <primitive key={name} object={scene} />
      ))}
    </Fragment>
  )
}

