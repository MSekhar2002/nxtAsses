import './index.css'
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom'

const Header = props => {
  const onClickLogout = () => {
    const {history} = props
    Cookies.remove('jwt_token')
    history.replace('/login')
    console.log('clicked')
    console.log(Cookies.remove('jwt_token'))
  }
  return (
    <nav className="nav-container">
      <div className="item-container">
        <img
          src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1704821765/Group_8005_vgjmvh.jpg"
          alt="website logo"
          className="image"
        />
      </div>
      <button onClick={onClickLogout} type="button" className="btn">
        Logout
      </button>
    </nav>
  )
}

export default withRouter(Header)
