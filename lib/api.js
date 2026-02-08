import axios from 'axios';
import { clearTokens, getAccessToken, saveTokens } from './secureStore';

// Base URL for all API calls
const API_BASE_URL = 'https://backend.bytebodh.in';
// const API_BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('\ud83d\ude80 API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request Data:', config.data);
    
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Auth Token:', token.substring(0, 20) + '...');
    } else {
      console.log('No Auth Token');
    }
    return config;
  },
  (error) => {
    console.error('\u274c Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    console.log('Response Data:', response.data);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const errorData = error.response?.data;
    
    // Only show detailed logs for unexpected errors (not 400, 404)
    if (status === 401) {
      console.log('401 Unauthorized - Clearing tokens');
      await clearTokens();
    } else if (status === 400) {
      // 400 errors are often expected (validation, already attempted, etc.)
      console.log(`⚠️ Bad Request (${url}):`, errorData?.message || error.message);
    } else if (status === 404) {
      console.log(`⚠️ Not Found (${url}):`, errorData?.message || error.message);
    } else {
      // Log full details for unexpected errors (500, network errors, etc.)
      console.error('❌ API Error Response:');
      console.error('Status:', status);
      console.error('URL:', url);
      console.error('Data:', errorData);
      console.error('Full Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Register new user
 * @param {string} fullName - User's full name
 * @param {string} username - Unique username
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const registerUser = async (fullName, username, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      fullName,
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

/**
 * Login with username/email and password
 * @param {string} username - Username or email
 * @param {string} password - User's password
 */
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    
    const { data } = response.data;
    
    // Save tokens
    if (data.accessToken && data.refreshToken) {
      await saveTokens(data.accessToken, data.refreshToken);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

/**
 * Google Login
 * @param {string} googleId - Google ID
 * @param {string} email - User's email
 * @param {string} fullName - User's full name
 * @param {string} pictureUrl - Profile picture URL
 */
export const googleLogin = async (googleId, email, fullName, pictureUrl) => {
  try {
    const response = await api.post('/auth/google', {
      googleId,
      email,
      fullName,
      pictureUrl,
    });
    
    const { data } = response.data;
    
    // Save tokens
    if (data.accessToken && data.refreshToken) {
      await saveTokens(data.accessToken, data.refreshToken);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Google login failed';
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user';
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    await clearTokens();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Change password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', null, {
      params: {
        oldPassword,
        newPassword,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to change password';
  }
};

// ============================================
// BLOG ENDPOINTS
// ============================================

/**
 * Get all blogs
 */
export const getBlogs = async () => {
  try {
    const response = await api.get('/api/blogs');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch blogs';
  }
};

/**
 * Get blog by ID
 * @param {string} id - Blog ID
 */
export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/api/blogs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch blog';
  }
};

// ============================================
// JOB ENDPOINTS
// ============================================
// ============================================
// JOB ENDPOINTS
// ============================================

/**
 * Get all job notifications
 */
export const getJobNotifications = () => api.get('/api/job-notifications');

/**
 * Get job notification by ID
 * @param {string} id - Job ID
 */
export const getJobNotificationById = (id) => api.get(`/api/job-notifications/${id}`);

/**
 * Create job notification
 * @param {object} data - Job data
 */
export const createJobNotification = (data) => api.post('/api/job-notifications', data);

/**
 * Update job notification
 * @param {string} id - Job ID
 * @param {object} data - Updated job data
 */
export const updateJobNotification = (id, data) => api.put(`/api/job-notifications/${id}`, data);

/**
 * Delete job notification
 * @param {string} id - Job ID
 */
export const deleteJobNotification = (id) => api.delete(`/api/job-notifications/${id}`);

// ============================================
// QUIZ ENDPOINTS
// ============================================

/**
 * Get all quizzes
 */
export const getQuizzes = async () => {
  try {
    const response = await api.get('/api/quizzes');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch quizzes';
  }
};

/**
 * Get quiz by ID
 * @param {string} id - Quiz ID
 */
export const getQuizById = async (id) => {
  try {
    const response = await api.get(`/api/quizzes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch quiz';
  }
};

/**
 * Submit quiz attempt
 * @param {object} data - Quiz attempt data
 */
export const submitQuizAttempt = async (data) => {
  try {
    const response = await api.post('/api/quiz/attempts', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit quiz';
  }
};

/**
 * Get quiz leaderboard
 * @param {string} quizId - Quiz ID
 */
export const getQuizLeaderboard = async (quizId) => {
  try {
    const response = await api.get(`/api/quiz/${quizId}/leaderboard`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch leaderboard';
  }
};

// ============================================
// TASK ENDPOINTS
// ============================================

/**
 * Create a new task
 * @param {object} data - Task data
 */
export const createTask = async (data) => {
  try {
    const response = await api.post('/api/tasks', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create task';
  }
};

/**
 * Get all user tasks
 */
export const getMyTasks = async () => {
  try {
    const response = await api.get('/api/tasks');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch tasks';
  }
};

/**
 * Update a task
 * @param {string} id - Task ID
 * @param {object} data - Updated task data
 */
export const updateTask = async (id, data) => {
  try {
    const response = await api.put(`/api/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update task';
  }
};

/**
 * Delete a task
 * @param {string} id - Task ID
 */
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete task';
  }
};

/**
 * Mark a task as completed
 * @param {string} id - Task ID
 */
export const completeTask = async (id) => {
  try {
    const response = await api.put(`/api/tasks/${id}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to complete task';
  }
};



// Export the base API URL
export { API_BASE_URL };
export default api;
