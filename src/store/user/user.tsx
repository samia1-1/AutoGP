// import { createSlice } from "@reduxjs/toolkit";
// import { request,setToken as _setToken,getToken } from "@/utils";
// import { useNavigate } from "react-router-dom";
// import { message } from "antd";

// interface loginForm {
//   username: string,
//   password: string
// }

// const userStore = createSlice({
//   name: 'user',
//   initialState: {
//     token: getToken()||'',
//     userInfo:{}
//   },
//   // 同步修改方法
//   reducers: {
//     setToken(state, action) {
//       state.token = action.payload
//       // localStorage.setItem('token_key',action.payload)
//       _setToken(action.payload)
//     },
//     setUserInfo(state,action){
//       state.userInfo=action.payload
//     }
//   }
// })

// const { setToken,setUserInfo } = userStore.actions
// const reducer = userStore.reducer

// // 异步修改方法
// const fetchLogin = (loginForm: loginForm) => {
//   const navigate = useNavigate()
//   return async (dispatch) => {
//     const res = await request.post('/user/login', loginForm)
//     console.log(res)
//     dispatch(setToken(res.data.token))
//     navigate('/home')
//     message.success("登陆成功！")
//   }
// }

// // 获取个人信息异步方法
// const fetchUserInfo = ()=>{
//   return async(dispatch)=>{
//     const res = await request.get("/user/profile获取个人信息接口")
//     dispatch(setUserInfo(res.data))
//   }
// }

// export { setToken, fetchLogin,setUserInfo,fetchUserInfo }
// export default reducer


export const setUser = (username) => ({
  type: 'SET_USER',
  payload: username,
});

const initialState = {
  username: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        username: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
