import { describe, it, expect } from 'vitest';
import { Money } from './Money';

describe('Money Value Object', () => {
  it('deve instanciar Money com precisão de centavos', () => {
    const m = Money.of(150.55);
    expect(m.cents).toBe(15055);
    expect(m.toNumber()).toBe(150.55);
    expect(m.amount).toBe(150.55);
  });

  it('deve fazer parse de strings em formatos variados', () => {
    expect(Money.of('R$ 1.250,50').cents).toBe(125050);
    expect(Money.of('150.00').cents).toBe(15000);
    expect(Money.of('150,00').cents).toBe(15000);
    expect(Money.of('').cents).toBe(0);
    expect(Money.of(null).cents).toBe(0);
  });

  it('deve realizar operações aritméticas sem erros de ponto flutuante', () => {
    const m1 = Money.of(0.1);
    const m2 = Money.of(0.2);
    const sum = m1.plus(m2);

    expect(sum.toNumber()).toBe(0.3); // No JS normal: 0.1 + 0.2 === 0.30000000000000004
    expect(sum.minus(0.1).toNumber()).toBe(0.2);
    expect(Money.of(100).times(2).toNumber()).toBe(200);
    expect(Money.of(100).percentage(10).toNumber()).toBe(10);
  });

  it('deve calcular e aplicar descontos percentuais e nominais', () => {
    const total = Money.of(200);

    // Desconto percentual
    expect(total.discountAmount(10).toNumber()).toBe(20);
    expect(total.applyDiscount(10).toNumber()).toBe(180);

    // Desconto nominal
    expect(total.applyDiscount(Money.of(20)).toNumber()).toBe(180);

    // Desconto maior que o total (não fica negativo)
    expect(total.applyDiscount(Money.of(300)).toNumber()).toBe(0);

    // Calcular percentual equivalente
    expect(total.calculateDiscountPercentage(Money.of(20))).toBe(10);
  });

  it('deve dividir em parcelas exatas distribuindo centavos excedentes', () => {
    const total = Money.of(100);
    const parts = total.split(3);

    expect(parts.length).toBe(3);
    expect(parts[0].toNumber()).toBe(33.34);
    expect(parts[1].toNumber()).toBe(33.33);
    expect(parts[2].toNumber()).toBe(33.33);

    const sum = parts.reduce((acc, p) => acc.plus(p), Money.zero());
    expect(sum.cents).toBe(total.cents);
  });

  it('deve comparar valores corretamente', () => {
    const m100 = Money.of(100);
    const m50 = Money.of(50);

    expect(m100.isGreaterThan(m50)).toBe(true);
    expect(m50.isLessThan(m100)).toBe(true);
    expect(m100.isEqualTo(Money.of(100))).toBe(true);
    expect(m100.isPositive()).toBe(true);
    expect(Money.zero().isZero()).toBe(true);
  });

  it('deve formatar no padrão brasileiro de moeda', () => {
    const formatted = Money.of(1250.5).formatted();
    expect(formatted).toContain('1.250,50');
  });
});
