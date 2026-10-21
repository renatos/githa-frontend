import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setViewportWidth } from '../../src/composables/useBreakpoint';
import MonthYearSelector from '../../src/components/common/MonthYearSelector.vue';
import DreReportView from '../../src/views/reports/financial/DreReportView.vue';
import BillingPaymentMethodsReportView from '../../src/views/reports/financial/BillingPaymentMethodsReportView.vue';
import SalesPerformanceReportView from '../../src/views/reports/sales/SalesPerformanceReportView.vue';
import { reportService } from '../../src/services/reportService';

const mockReplace = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { month: '1', year: '2026' } }),
  useRouter: () => ({ replace: mockReplace })
}));

vi.mock('../../src/services/reportService', () => ({
  reportService: {
    getDre: vi.fn(),
    getBillingByPaymentMethod: vi.fn(),
    getSalesPerformance: vi.fn()
  }
}));

const globalMountOptions = {
  global: {
    stubs: {
      RouterLink: {
        template: '<a><slot /></a>'
      }
    }
  }
};

describe('Report Mobile Dynamic Labels & Period Rollover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setViewportWidth(1280);

    reportService.getDre.mockResolvedValue({
      data: {
        revenue: { total: 50000, categories: [{ category: 'Estética Facial', amount: 50000 }] },
        opex: { total: 15000, categories: [{ category: 'Insumos', amount: 15000 }] },
        capex: { total: 5000, categories: [] },
        netProfit: 30000,
        netMarginPercentage: 60
      }
    });

    reportService.getBillingByPaymentMethod.mockResolvedValue({
      data: {
        totalGross: 20000,
        totalNet: 19000,
        totalDiscounts: 1000,
        methods: [
          {
            methodId: 1,
            methodName: 'Cartão de Crédito',
            transactionsCount: 10,
            grossAmount: 20000,
            netAmount: 19000,
            discountPercentageAverage: 5
          }
        ]
      }
    });

    reportService.getSalesPerformance.mockResolvedValue({
      data: {
        totalGrossSales: 30000,
        totalNetSales: 28000,
        totalSalesCount: 15,
        averageTicket: 2000,
        totalDiscounts: 2000,
        serviceRevenue: 25000,
        serviceRevenuePercentage: 83.3,
        productRevenue: 5000,
        productRevenuePercentage: 16.7,
        topServices: [
          {
            itemId: 1,
            itemName: 'Toxina Botulínica Completa',
            quantity: 12,
            grossRevenue: 25000,
            netRevenue: 23500,
            discountAmount: 1500,
            percentageOfCategory: 100
          }
        ],
        topProducts: []
      }
    });
  });

  it('switches MonthYearSelector label between full desktop and short mobile format', async () => {
    const wrapper = mount(MonthYearSelector, {
      props: { month: 10, year: 2026 }
    });

    setViewportWidth(1280);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Outubro 2026');

    setViewportWidth(375);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Out/2026');
  });

  it('switches DRE report labels dynamically on mobile and fetches once on year rollover', async () => {
    const wrapper = mount(DreReportView, globalMountOptions);
    await flushPromises();

    // Desktop labels
    expect(wrapper.text()).toContain('RECEITA BRUTA OPERACIONAL');
    expect(wrapper.text()).toContain('INVESTIMENTOS DE CAPITAL (CAPEX)');
    expect(wrapper.text()).toContain('Classificação / Categoria');

    // Switch to Mobile (< 640px)
    setViewportWidth(375);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('RECEITA BRUTA');
    expect(wrapper.text()).not.toContain('RECEITA BRUTA OPERACIONAL');
    expect(wrapper.text()).toContain('INVEST. (CAPEX)');
    expect(wrapper.text()).toContain('% Rec.');

    // Navigate previous month from January 2026 -> December 2025 (rolls over both month and year)
    reportService.getDre.mockClear();
    const prevBtn = wrapper.find('button[title="Mês anterior"]');
    await prevBtn.trigger('click');
    await flushPromises();

    expect(reportService.getDre).toHaveBeenCalledTimes(1);
    expect(reportService.getDre).toHaveBeenCalledWith({ month: 12, year: 2025 });
  });

  it('switches Billing by Payment Methods table headers dynamically on mobile', async () => {
    const wrapper = mount(BillingPaymentMethodsReportView, globalMountOptions);
    await flushPromises();

    expect(wrapper.text()).toContain('Forma de Pagamento');
    expect(wrapper.text()).toContain('Total Consolidado');

    setViewportWidth(375);
    await wrapper.vm.$nextTick();

    const headers = wrapper.findAll('th').map((h) => h.text());
    expect(headers).toEqual(['Método', 'Qtd.', 'Bruto', 'Líquido', 'Taxas', '% Taxa', '% Share']);
    expect(wrapper.find('tfoot').text()).toContain('Total');
    expect(wrapper.find('tfoot').text()).not.toContain('Total Consolidado');
  });

  it('switches Sales Performance report headers and KPI labels dynamically on mobile', async () => {
    const wrapper = mount(SalesPerformanceReportView, globalMountOptions);
    await flushPromises();

    expect(wrapper.text()).toContain('Qtd Executada');
    expect(wrapper.text()).toContain('Share Categoria (%)');

    setViewportWidth(375);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Fat. Bruto');
    expect(wrapper.text()).toContain('Qtd.');
    expect(wrapper.text()).toContain('% Cat.');
    expect(wrapper.text()).not.toContain('Qtd Executada');
  });
});
