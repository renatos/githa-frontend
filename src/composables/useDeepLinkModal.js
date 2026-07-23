/**
 * ==============================================================================
 * GITHA DEEP LINKING & CONVENTION OVER CONFIGURATION (CoC) ENGINE
 * ==============================================================================
 *
 * Este composable gerencia a resolução e abertura automática de formulários/modais
 * a partir de links no formato `/link/:code` ou parâmetros de query (`?modal=TYPE&modalId=ID`).
 *
 * ------------------------------------------------------------------------------
 * REGRAS DE CONVENÇÃO SOBRE CONFIGURAÇÃO (CoC)
 * ------------------------------------------------------------------------------
 * Para qualquer novo tipo de recurso (ex: `targetType = "PROFESSIONAL"`), o sistema
 * infere automaticamente todos os 4 elementos abaixo sem necessitar de código extra:
 *
 * 1. COMPONENTE (Form Modal):
 *    - Procurado via `import.meta.glob('@/components/** /*Form.vue')`
 *    - Convenção de nome: `PascalCase(targetType) + 'Form.vue'` (ex: `ProfessionalForm.vue`)
 *
 * 2. PROP DO COMPONENTE:
 *    - Convenção: `camelCase(targetType)` (ex: `:professional="data"`)
 *
 * 3. ROTA DE DESTINO (View Screen):
 *    - Convenção: `'/' + lowercase(targetType) + 's'` (ex: `/professionals`)
 *
 * 4. SERVIÇO DE DADOS (Fetcher):
 *    - Convenção: `import('@/services/' + camelCase(targetType) + 'Service.js')`
 *    - Método invocado: `service.getById(id)` (ou `service.default.getById(id)`)
 *
 * ------------------------------------------------------------------------------
 * COMO ADICIONAR UMA NOVA TELA / FORMULÁRIO
 * ------------------------------------------------------------------------------
 * - SE SEGUE A CONVENÇÃO:
 *   Basta criar o formulário `XxxForm.vue` e o serviço `xxxService.js` com o método `getById(id)`.
 *   Nenhuma linha de código precisa ser alterada em `useDeepLinkModal.js` ou no backend!
 *
 * - SE FOGE DA CONVENÇÃO (Exceções):
 *   Adicione apenas a propriedade divergente no objeto `OVERRIDES` abaixo.
 * ==============================================================================
 */



/**
 * Mapeamento de exceções que fogem da convenção padrão de nomes/rotas.
 */
const OVERRIDES = {
  REMINDER: {
    route: '/', // Rota padrão é o Dashboard em vez de /reminders
  },
  TRANSACTION: {
    route: '/financials', // Rota é /financials em vez de /transactions
    propName: 'transaction',
    fetcher: async (id) => {
      const mod = await import('../services/financialService.js');
      const svc = mod.default || mod.financialService;
      const res = await svc.getTransactionById(id);
      return res.data ?? res;
    }
  },
  FINANCIAL_TRANSACTION: {
    route: '/financials',
    propName: 'transaction',
    fetcher: async (id) => {
      const mod = await import('../services/financialService.js');
      const svc = mod.default || mod.financialService;
      const res = await svc.getTransactionById(id);
      return res.data ?? res;
    }
  }
};

// Auto-descoberta de todos os formulários modais sob src/components
const formModules = import.meta.glob('@/components/**/*Form.vue');

function toPascalCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Resolve os metadados de abertura do modal para um dado targetType.
 * @param {string} targetType - ex: 'REMINDER', 'CLIENT', 'APPOINTMENT', 'PROFESSIONAL'
 */
export function resolveModalConfig(targetType) {
  if (!targetType) return null;

  const normalizedType = targetType.trim().toUpperCase();
  const override = OVERRIDES[normalizedType] || {};

  const pascalName = toPascalCase(normalizedType);
  const camelName = toCamelCase(normalizedType);

  // 1. Resolve Rota
  const route = override.route ?? `/${camelName}s`;

  // 2. Resolve Prop Name
  const propName = override.propName ?? camelName;

  // 3. Resolve Component (lazy import)
  const componentLoader = override.component ?? (() => {
    const targetFileName = `${pascalName}Form.vue`;
    const matchedPath = Object.keys(formModules).find(path => path.endsWith(`/${targetFileName}`) || path.endsWith(`\\${targetFileName}`));
    
    if (!matchedPath) {
      console.warn(`[useDeepLinkModal] Form component not found for type '${targetType}' (${targetFileName})`);
      return Promise.reject(new Error(`Form component not found: ${targetFileName}`));
    }
    return formModules[matchedPath]();
  });

  // 4. Resolve Fetcher (service data loader)
  const fetcher = override.fetcher ?? (async (id) => {
    const serviceName = `${camelName}Service`;
    try {
      const mod = await import(`../services/${serviceName}.js`);
      const serviceObj = mod.default || mod[serviceName];
      if (!serviceObj || typeof serviceObj.getById !== 'function') {
        throw new Error(`Method getById is missing on service ${serviceName}`);
      }
      const response = await serviceObj.getById(id);
      return response.data ?? response;
    } catch (err) {
      console.error(`[useDeepLinkModal] Failed to fetch entity ${targetType} #${id}:`, err);
      throw err;
    }
  });

  return {
    targetType: normalizedType,
    route,
    propName,
    componentLoader,
    fetcher
  };
}

export function useDeepLinkModal() {
  return {
    resolveModalConfig
  };
}
