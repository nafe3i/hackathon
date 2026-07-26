import api from "./axiosClient";

export const getPublicProfile = (publicId) => api.get(`/public/${publicId}`).then((response) => response.data);
export const sendPublicMessage = (publicId, message, history) => api.post(`/public/${publicId}/chat`, { message, history }).then((response) => response.data);
