import axios from "axios";
import { BASEURL } from "../Constant/constant";
import { logout } from "../store/authSlice";
import store from "../store/store"; 
const axiosInstance = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshToken) {
      config.headers["refresh-token"] = refreshToken;
    }

    console.log("Request Interceptor:", config);
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  async (response) => {
    console.log("Response Interceptor:", response);
    console.log("Response Headers:", response.headers);

    if (response.data.accessToken) {
      const newAccessToken = response.data.accessToken;

      // Update the local storage with the new access token
      localStorage.setItem("accessToken", newAccessToken);
    }

    return response;
  },
  async (error) => {
    console.error("Response Interceptor Error:", error);

    if (error.response && error.response.status === 419) {
      // Handle 419 error by refreshing the token
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        console.log("Inside token expiration handler, refreshing token...");
        const refreshResponse = await axios.get(
          `http://localhost:5000/refresh/refreshtoken`,
          {
            headers: {
              'refresh-token': refreshToken
            }
          }
        );
        console.log("-----------------resrefresh", refreshResponse);

        const newAccessToken = refreshResponse.data.accessToken;
        console.log("new token", newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        // Retry the original request with the new access token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing access token:", refreshError);

        // If the refresh token has expired, dispatch logout action
        if (refreshError.response.status === 401 && refreshError.response.data.message === "Refresh token has expired") {
          store.dispatch(logout());
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;



// import axios from "axios";
// import { BASEURL } from "../Constant/constant";
// import { useDispatch } from "react-redux";
// import { logout } from "../store/authSlice";
// const axiosInstance = axios.create({
//   baseURL: BASEURL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const accessToken = localStorage.getItem("accessToken");
//     const refreshToken = localStorage.getItem("refreshToken");

//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }

//     if (refreshToken) {
//       config.headers["refresh-token"] = refreshToken;
//     }

//     console.log("Request Interceptor:", config);
//     return config;
//   },
//   (error) => {
//     console.error("Request Interceptor Error:", error);
//     return Promise.reject(error);
//   }
// );


// axiosInstance.interceptors.response.use(

//   async (response) => {
//     console.log("Response Interceptor:", response);
//     console.log("Response Headers:", response.headers);

//     if (response.data.accessToken) {
//       const newAccessToken = response.data.accessToken;

//       // Update the local storage with the new access token
//       localStorage.setItem("accessToken", newAccessToken);
//     }

//     return response;
//   },
//   async (error) => {
//     const dispatch = useDispatch();
//     console.error("Response Interceptor Error:", error);

//     if (error.response && error.response.status === 419) {
//       // Handle 419 error by refreshing the token
//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         console.log("Inside token expiration handler, refreshing token...");
//         const refreshResponse = await axios.get(
//           `http://localhost:5000/refresh/refreshtoken`,
//           {
//             headers: {
//               'refresh-token': refreshToken
//             }
//           }
//         );
//         console.log("-----------------resrefresh", refreshResponse);

//         const newAccessToken = refreshResponse.data.accessToken;
//         console.log("new token", newAccessToken);
//         localStorage.setItem("accessToken", newAccessToken);

//         // Retry the original request with the new access token
//         const originalRequest = error.config;
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.error("Error refreshing access token:", refreshError);

//         // If the refresh token has expired, redirect to the signin page
//         if (refreshError.response.status === 401 && refreshError.response.data.message === "Refresh token has expired") {
//           // window.location.href = "/signin"; // Redirect to the signin page
//           dispatch(logout());
//         }

//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );


// export default axiosInstance;