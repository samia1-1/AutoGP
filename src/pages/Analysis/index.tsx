import { Outlet } from 'react-router-dom'
import './index.scss'

const Analysis = () => {

  return (
    <div className='analysis'>
      <div className="OutletContainer">
        <Outlet />
      </div>
    </ div>
  )
}

export default Analysis