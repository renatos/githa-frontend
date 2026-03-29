import api from './api';

export const goalService = {
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
  }
};
