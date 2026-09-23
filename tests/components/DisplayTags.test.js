import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DisplayTags from '@/components/common/DisplayTags.vue';

describe('DisplayTags.vue', () => {
  it('renders nothing when tags array is empty', () => {
    const wrapper = mount(DisplayTags, {
      props: { tags: [] }
    });
    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('renders tags with labels and values', () => {
    const tags = [
      { label: 'Última Visita', value: '15/08/2026' },
      { label: 'Valor', value: 'R$ 150,00' }
    ];
    const wrapper = mount(DisplayTags, {
      props: { tags }
    });

    const spans = wrapper.findAll('span.inline-flex');
    expect(spans.length).toBe(2);
    expect(wrapper.text()).toContain('Última Visita:');
    expect(wrapper.text()).toContain('15/08/2026');
    expect(wrapper.text()).toContain('Valor:');
    expect(wrapper.text()).toContain('R$ 150,00');
  });

  it('renders tag without label if label is omitted', () => {
    const tags = [{ value: 'Destaque' }];
    const wrapper = mount(DisplayTags, {
      props: { tags }
    });

    expect(wrapper.text()).toContain('Destaque');
  });
});
