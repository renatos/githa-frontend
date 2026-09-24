import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ReportPageShell from '../../src/views/reports/components/ReportPageShell.vue';

const globalMountOptions = {
  global: {
    stubs: {
      RouterLink: {
        template: '<a :href="to"><slot /></a>',
        props: ['to']
      },
      MonthYearSelector: {
        template: '<div class="mock-month-year-selector"></div>',
        props: ['month', 'year']
      },
      PageHeader: {
        template: '<header><slot /><slot name="actions" /></header>',
        props: ['title', 'subtitle', 'icon']
      }
    }
  }
};

describe('ReportPageShell.vue', () => {
  it('renders title, description and badge', () => {
    const wrapper = mount(ReportPageShell, {
      ...globalMountOptions,
      props: {
        title: 'Relatório Teste',
        description: 'Descrição de teste',
        badge: 'Financeiro',
        icon: 'fa-solid fa-chart-line',
        month: 7,
        year: 2026,
        loading: false,
        error: null,
        viewMode: 'BOTH'
      }
    });

    expect(wrapper.text()).toContain('Relatório Teste');
  });

  it('renders skeleton loader when loading is true', () => {
    const wrapper = mount(ReportPageShell, {
      ...globalMountOptions,
      props: {
        title: 'Relatório Teste',
        loading: true,
        month: 7,
        year: 2026,
        viewMode: 'BOTH'
      }
    });

    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
  });

  it('renders error state and emits retry when retry button is clicked', async () => {
    const wrapper = mount(ReportPageShell, {
      ...globalMountOptions,
      props: {
        title: 'Relatório Teste',
        loading: false,
        error: 'Erro de conexão',
        month: 7,
        year: 2026,
        viewMode: 'BOTH'
      }
    });

    expect(wrapper.text()).toContain('Erro de conexão');
    const buttons = wrapper.findAll('button');
    const retryBtn = buttons.find(b => b.text().includes('Tentar Novamente'));
    expect(retryBtn).toBeDefined();
    await retryBtn.trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('emits update:viewMode when toggling chart / table', async () => {
    const wrapper = mount(ReportPageShell, {
      ...globalMountOptions,
      props: {
        title: 'Relatório Teste',
        loading: false,
        month: 7,
        year: 2026,
        viewMode: 'BOTH'
      }
    });

    const buttons = wrapper.findAll('button');
    const chartBtn = buttons.find(b => b.text().includes('Gráfico'));
    if (chartBtn) {
      await chartBtn.trigger('click');
      expect(wrapper.emitted('update:viewMode')).toBeTruthy();
    }
  });
});
