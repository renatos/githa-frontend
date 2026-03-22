import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LoginView from '../../src/views/LoginView.vue';
import GoogleLoginButton from '../../src/components/common/GoogleLoginButton.vue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

vi.mock('../../src/services/authService', () => ({
  authService: {
    mockLogin: vi.fn(),
    login: vi.fn()
  }
}));

describe('LoginView.vue Component', () => {

  it('renders GoogleLoginButton by default in test env', () => {
    const wrapper = mount(LoginView, {
      global: { components: { GoogleLoginButton } }
    });
    
    // We expect the mock toggle to be false or undefined initially in Vitest
    const mockContainer = wrapper.find('.mock-login-container');
    const googleBtn = wrapper.findComponent(GoogleLoginButton);
    
    expect(googleBtn.exists()).toBe(true);
    expect(mockContainer.exists()).toBe(false);
  });
});
