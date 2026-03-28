import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const goalService = {
  createGoal(goal) {
    return axios.post(`${API_URL}/goals`, goal);
  },
  
  deleteGoal(id) {
    return axios.delete(`${API_URL}/goals/${id}`);
  },
  
  listGoals(professionalId, year) {
    const params = { year };
    if (professionalId) params.professionalId = professionalId;
    return axios.get(`${API_URL}/goals`, { params });
  },
  
  getGoalProgress(professionalId, month, year) {
    const params = { month, year };
    if (professionalId) params.professionalId = professionalId;
    return axios.get(`${API_URL}/goals/progress`, { params });
  }
};
