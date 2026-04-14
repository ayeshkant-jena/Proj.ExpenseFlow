import api from "./axios";

export const createExpense = (data) => api.post("/expenses", data);
export const getMyExpenses = () => api.get("/expenses/my");
export const getAllExpenses = () => api.get("/expenses");
export const updateExpenseStatus = (id, status, rejectionReason = "") =>
  api.patch(`/expenses/${id}/status`, { status, rejectionReason });
export const updateExpense = (id, data) => api.patch(`/expenses/${id}`, data);
