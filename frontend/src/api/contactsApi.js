import api from "./axiosClient";

export const createInvitation = (email) => api.post("/invitations", { email }).then((response) => response.data);
export const getInvitations = () => api.get("/invitations").then((response) => response.data);
export const getNetwork = () => api.get("/network").then((response) => response.data);
export const getInvitation = (token) => api.get(`/invitations/${token}`).then((response) => response.data);
export const acceptInvitation = (token, data) => api.post(`/invitations/${token}/accept`, data).then((response) => response.data);
export const rejectInvitation = (token) => api.post(`/invitations/${token}/reject`).then((response) => response.data);
export const broadcastAlert = () => api.post("/alerts/broadcast").then((response) => response.data);
export const getAlerts = () => api.get("/alerts").then((response) => response.data);
export const markAlertRead = (id) => api.patch(`/alerts/${id}/read`).then((response) => response.data);
