import api from "./axiosClient";
export const getCards = () => api.get("/cards").then((r) => r.data);
export const createCard = (data) => api.post("/cards", data).then((r) => r.data);
export const updateCard = (id, data) => api.patch(`/cards/${id}`, data).then((r) => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
