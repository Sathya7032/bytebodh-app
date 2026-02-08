import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save authentication tokens securely
 */
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem("access_token", accessToken);
    await AsyncStorage.setItem("refresh_token", refreshToken);
  } catch (error) {
    console.error("Error saving tokens:", error);
    throw error;
  }
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem("refresh_token");
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

/**
 * Clear all tokens
 */
export const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "authenticated", "user_data"]);
  } catch (error) {
    console.error("Error clearing tokens:", error);
    throw error;
  }
};

/**
 * Save user data
 */
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem("user_data", JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem("user_data");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Set authentication status
 */
export const setAuthenticated = async (value) => {
  try {
    await AsyncStorage.setItem("authenticated", value.toString());
  } catch (error) {
    console.error("Error setting authenticated:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const value = await AsyncStorage.getItem("authenticated");
    return value === "true";
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
