import api from './api';

export const goalService = {
  getById(id) {
    return api.get(`/goals/${id}`);
  },

  createGoal(goal) {
    return api.post('/goals', goal);
  },
  
  updateGoal(id, goal) {
    return api.put(`/goals/${id}`, goal);
  },
  
  deleteGoal(id) {
    return api.delete(`/goals/${id}`);
  },
  
  listGoals(professionalId, year) {
    const params = { year };
    if (professionalId) params.professionalId = professionalId;
    return api.get('/goals', { params });
  },
  
  getGoalProgress(professionalId, month, year) {
    const params = { month, year };
    if (professionalId) params.professionalId = professionalId;
    return api.get('/goals/progress', { params });
  },

  getGoalSuggestions(professionalId, month, year) {
    const params = { month, year };
    if (professionalId) params.professionalId = professionalId;
    return api.get('/goals/suggest', { params });
  }
};
