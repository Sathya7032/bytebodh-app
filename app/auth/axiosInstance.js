// api/axiosInstance.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://bytebodh.codewithsathya.info/"; // ⚠️ change for your server

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token before each request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Refresh token if expired (optional enhancement)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = await AsyncStorage.getItem("refreshToken");

      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh,
          });
          const newAccess = res.data.access;
          await AsyncStorage.setItem("accessToken", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (err) {
          console.log("Token refresh failed", err);
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
