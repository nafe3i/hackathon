import api from "./axiosClient";
export const registerRequest = (data) => api.post("/auth/register", data).then((r) => r.data);
export const loginRequest = (data) => api.post("/auth/login", data).then((r) => r.data);
export const meRequest = () => api.get("/auth/me").then((r) => r.data);
