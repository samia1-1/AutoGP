import { Outlet } from "react-router-dom"
import './index.scss'

const Manage = () => {
  return (
    <div className="Manage">
      <div className="OutletContainer">
        <Outlet/>
      </div>
    </div>
  )
}

export default Manage
