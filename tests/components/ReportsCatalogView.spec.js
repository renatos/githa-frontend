import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ReportsCatalogView from '../../src/views/reports/ReportsCatalogView.vue';

describe('ReportsCatalogView.vue', () => {
  const globalMountOptions = {
    global: {
      stubs: {
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to']
        }
      }
    }
  };

  it('renders all reports by default in ALL tab', () => {
    const wrapper = mount(ReportsCatalogView, globalMountOptions);
    expect(wrapper.text()).toContain('Central de Relatórios');
    expect(wrapper.text()).toContain('DRE Simplificado');
    expect(wrapper.text()).toContain('Faturamento por Forma de Pagamento');
  });

  it('filters reports when typing in search input', async () => {
    const wrapper = mount(ReportsCatalogView, globalMountOptions);
    const searchInput = wrapper.find('input[type="text"]');
    
    await searchInput.setValue('DRE');
    expect(wrapper.text()).toContain('DRE Simplificado');
    expect(wrapper.text()).not.toContain('Faturamento por Forma de Pagamento');

    await searchInput.setValue('cartão');
    expect(wrapper.text()).toContain('Faturamento por Forma de Pagamento');
    expect(wrapper.text()).not.toContain('DRE Simplificado');
  });

  it('renders available report links', () => {
    const wrapper = mount(ReportsCatalogView, globalMountOptions);
    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
