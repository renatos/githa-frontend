/**
 * Value Object Money para o Frontend.
 * 
 * Opera internamente com números inteiros em centavos para eliminar erros de
 * ponto flutuante do JavaScript (ex: 0.1 + 0.2 !== 0.3).
 * Possui paridade de métodos com o Money.java do backend.
 */
export class Money {
  #cents;

  constructor(cents = 0) {
    this.#cents = Math.round(Number(cents) || 0);
  }

  /**
   * Factory method para criar instância a partir de Number, String ou outro Money.
   * @param {number|string|Money|null|undefined} value
   * @returns {Money}
   */
  static of(value) {
    if (value === null || value === undefined) {
      return Money.zero();
    }
    if (value instanceof Money) {
      return new Money(value.cents);
    }
    if (typeof value === 'number') {
      if (isNaN(value)) return Money.zero();
      return new Money(Math.round(value * 100));
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return Money.zero();
      // Limpa R$, espaços e caracteres não numéricos exceto , e .
      let sanitized = trimmed
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\u00A0/g, '');

      if (sanitized.includes(',') && sanitized.includes('.')) {
        sanitized = sanitized.replace(/\./g, '').replace(',', '.');
      } else if (sanitized.includes(',')) {
        sanitized = sanitized.replace(',', '.');
      }

      const num = parseFloat(sanitized);
      return isNaN(num) ? Money.zero() : new Money(Math.round(num * 100));
    }
    return Money.zero();
  }

  static zero() {
    return new Money(0);
  }

  get cents() {
    return this.#cents;
  }

  get amount() {
    return this.toNumber();
  }

  toNumber() {
    return Number((this.#cents / 100).toFixed(2));
  }

  toString() {
    return (this.#cents / 100).toFixed(2);
  }

  toJSON() {
    return this.toNumber();
  }

  valueOf() {
    return this.toNumber();
  }

  formatted() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.toNumber());
  }

  plus(other) {
    const o = other instanceof Money ? other : Money.of(other);
    return new Money(this.#cents + o.cents);
  }

  minus(other) {
    const o = other instanceof Money ? other : Money.of(other);
    return new Money(this.#cents - o.cents);
  }

  times(factor) {
    const f = Number(factor) || 0;
    return new Money(Math.round(this.#cents * f));
  }

  percentage(percent) {
    const p = Number(percent) || 0;
    return new Money(Math.round((this.#cents * p) / 100));
  }

  /**
   * Retorna o valor nominal de desconto dado um percentual.
   */
  discountAmount(percent) {
    return this.percentage(percent);
  }

  /**
   * Aplica um desconto (percentual ou nominal em Money) e retorna o novo valor líquido.
   * Não permite valor negativo (mínimo Money.zero()).
   */
  applyDiscount(percentOrAmount) {
    if (percentOrAmount === null || percentOrAmount === undefined) {
      return this;
    }

    let discount;
    if (percentOrAmount instanceof Money) {
      discount = percentOrAmount;
    } else if (typeof percentOrAmount === 'object' && 'cents' in percentOrAmount) {
      discount = new Money(percentOrAmount.cents);
    } else {
      // Trata como percentual
      const pct = Number(percentOrAmount);
      if (isNaN(pct) || pct <= 0) return this;
      discount = this.discountAmount(pct);
    }

    if (discount.isZero() || discount.isNegative()) {
      return this;
    }

    return this.isGreaterThan(discount) ? this.minus(discount) : Money.zero();
  }

  /**
   * Calcula o percentual que um valor de desconto representa sobre este total.
   */
  calculateDiscountPercentage(discountAmount) {
    if (this.isZero() || !discountAmount) {
      return 0;
    }
    const d = discountAmount instanceof Money ? discountAmount : Money.of(discountAmount);
    if (d.isZero()) return 0;
    return Number(((d.cents * 100) / this.#cents).toFixed(4));
  }

  /**
   * Divide o valor em N parcelas exatas, distribuindo centavos excedentes
   * na primeira parcela para que a soma seja exatamente igual ao total.
   */
  split(installments) {
    const count = parseInt(installments, 10);
    if (isNaN(count) || count <= 0) {
      throw new Error('O número de parcelas deve ser maior que zero.');
    }
    const baseCents = Math.floor(this.#cents / count);
    const remainder = this.#cents % count;

    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push(new Money(baseCents + (i < remainder ? 1 : 0)));
    }
    return parts;
  }

  isZero() {
    return this.#cents === 0;
  }

  isPositive() {
    return this.#cents > 0;
  }

  isNegative() {
    return this.#cents < 0;
  }

  compareTo(other) {
    const o = other instanceof Money ? other : Money.of(other);
    return this.#cents - o.cents;
  }

  isGreaterThan(other) {
    return this.compareTo(other) > 0;
  }

  isGreaterThanOrEqual(other) {
    return this.compareTo(other) >= 0;
  }

  isLessThan(other) {
    return this.compareTo(other) < 0;
  }

  isLessThanOrEqual(other) {
    return this.compareTo(other) <= 0;
  }

  isEqualTo(other) {
    return this.compareTo(other) === 0;
  }
}
