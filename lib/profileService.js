import api from './api';

export const getMyProfile = async () => {
  try {
    const response = await api.get('/api/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createProfile = async (data) => {
  try {
    const response = await api.post('/api/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put('/api/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
