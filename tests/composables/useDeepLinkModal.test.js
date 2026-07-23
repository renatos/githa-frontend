import { describe, it, expect } from 'vitest';
import { resolveModalConfig } from '@/composables/useDeepLinkModal';

describe('useDeepLinkModal', () => {
  it('resolves CLIENT using convention over configuration', () => {
    const config = resolveModalConfig('CLIENT');
    expect(config).not.toBeNull();
    expect(config.targetType).toBe('CLIENT');
    expect(config.route).toBe('/clients');
    expect(config.propName).toBe('client');
    expect(typeof config.componentLoader).toBe('function');
    expect(typeof config.fetcher).toBe('function');
  });

  it('resolves REMINDER using override route', () => {
    const config = resolveModalConfig('REMINDER');
    expect(config).not.toBeNull();
    expect(config.targetType).toBe('REMINDER');
    expect(config.route).toBe('/');
    expect(config.propName).toBe('reminder');
  });

  it('resolves TRANSACTION using override route', () => {
    const config = resolveModalConfig('TRANSACTION');
    expect(config).not.toBeNull();
    expect(config.targetType).toBe('TRANSACTION');
    expect(config.route).toBe('/financials');
    expect(config.propName).toBe('transaction');
  });

  it('resolves PROFESSIONAL using convention over configuration', () => {
    const config = resolveModalConfig('PROFESSIONAL');
    expect(config).not.toBeNull();
    expect(config.targetType).toBe('PROFESSIONAL');
    expect(config.route).toBe('/professionals');
    expect(config.propName).toBe('professional');
  });
});
