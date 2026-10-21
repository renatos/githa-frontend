import { describe, it, expect, beforeEach } from 'vitest';
import { useBreakpoint, setViewportWidth } from '../../src/composables/useBreakpoint';

describe('useBreakpoint composable', () => {
  beforeEach(() => {
    setViewportWidth(1280);
  });

  it('detects desktop viewport (>= 1024px) and returns desktop labels', () => {
    const { isMobile, isTablet, isDesktop, rLabel, truncateLabel } = useBreakpoint();

    expect(isDesktop.value).toBe(true);
    expect(isTablet.value).toBe(false);
    expect(isMobile.value).toBe(false);
    expect(rLabel('Faturamento Bruto', 'Bruto')).toBe('Faturamento Bruto');
    expect(truncateLabel('Harmonização Facial Completa', 14, 34)).toBe('Harmonização Facial Completa');
  });

  it('detects tablet viewport (640px - 1023px) and keeps full labels', () => {
    setViewportWidth(768);
    const { isMobile, isTablet, isDesktop, rLabel } = useBreakpoint();

    expect(isDesktop.value).toBe(false);
    expect(isTablet.value).toBe(true);
    expect(isMobile.value).toBe(false);
    expect(rLabel('Faturamento Bruto', 'Bruto')).toBe('Faturamento Bruto');
  });

  it('detects mobile viewport (< 640px) and switches to compact labels and truncation', () => {
    setViewportWidth(375);
    const { isMobile, isTablet, isDesktop, rLabel, truncateLabel } = useBreakpoint();

    expect(isMobile.value).toBe(true);
    expect(isTablet.value).toBe(false);
    expect(isDesktop.value).toBe(false);
    expect(rLabel('Faturamento Bruto', 'Bruto')).toBe('Bruto');
    expect(rLabel('INVESTIMENTOS DE CAPITAL (CAPEX)', 'INVEST. (CAPEX)')).toBe('INVEST. (CAPEX)');
    expect(truncateLabel('Harmonização Facial Completa', 14, 34)).toBe('Harmonização…');
  });
});
