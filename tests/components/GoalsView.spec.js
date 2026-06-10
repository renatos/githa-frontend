import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoalsView from '../../src/views/GoalsView.vue';
import { goalService } from '../../src/services/goalService';

vi.mock('../../src/services/goalService', () => ({
  goalService: {
    getGoalProgress: vi.fn(() => Promise.resolve({ data: null })),
    getGoalSuggestions: vi.fn(() => Promise.resolve({
      data: [
        {
          methodKey: 'BREAK_EVEN',
          methodName: 'Ponto de Equilíbrio',
          suggestedAmount: 15000,
          description: 'Sugerida',
          available: true
        }
      ]
    }))
  }
}));

vi.mock('../../src/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({ roles: ['ADMIN'] }))
  }
}));

vi.mock('../../src/services/professionalService', () => ({
  professionalService: {
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  }
}));

vi.mock('../../src/services/clientService', () => ({
  clientService: {}
}));

vi.mock('../../src/services/toastBridge', () => ({
  toastBridge: {
    getToast: vi.fn(() => ({ add: vi.fn() }))
  }
}));

describe('GoalsView.vue suggestions integration', () => {
  it('loads suggestions and populates input when suggestion is selected', async () => {
    const wrapper = mount(GoalsView);

    // Open goal creation modal
    wrapper.vm.showGoalModal = true;
    await wrapper.vm.$nextTick();

    // Trigger suggestions fetch
    await wrapper.vm.fetchGoalSuggestions();
    await wrapper.vm.$nextTick();

    expect(goalService.getGoalSuggestions).toHaveBeenCalled();
    expect(wrapper.vm.suggestions.length).toBe(1);

    // Select the suggestion option
    wrapper.vm.selectSuggestion(wrapper.vm.suggestions[0]);
    expect(wrapper.vm.newGoal.targetAmount).toBe(15000);
  });
});
