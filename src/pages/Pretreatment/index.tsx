
import { Outlet } from 'react-router-dom'
import './index.scss'

const Pretreatment = () => {
  return (
    <div className="pretreatment">
      <div className="OutletContainer">
        <Outlet />
      </div>
    </div>
  )
}

export default Pretreatment