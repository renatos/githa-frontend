export const REPORT_CATEGORIES = [
  { id: 'ALL', label: 'Todos os Relatórios', icon: 'fa-solid fa-layer-group' },
  { id: 'FINANCIAL', label: 'Relatórios Financeiros', icon: 'fa-solid fa-sack-dollar' },
  { id: 'OPERATIONAL', label: 'Operacionais & Vendas', icon: 'fa-solid fa-chart-line' },
  { id: 'CLIENTS', label: 'Clientes & Fidelização', icon: 'fa-solid fa-users' }
];

export const REPORTS_REGISTRY = [
  {
    id: 'dre-simplificado',
    title: 'DRE Simplificado',
    description: 'Demonstrativo de receitas, despesas operacionais (OPEX), investimentos (CAPEX), lucro e margem líquida da clínica.',
    category: 'FINANCIAL',
    icon: 'fa-solid fa-file-invoice-dollar',
    route: '/reports/financial/dre',
    badge: 'Financeiro',
    tags: ['lucro', 'despesas', 'opex', 'capex', 'receita', 'margem', 'dre', 'resultado'],
    isAvailable: true
  },
  {
    id: 'billing-payment-methods',
    title: 'Faturamento por Forma de Pagamento',
    description: 'Distribuição dos recebimentos por método (Cartão, PIX, Dinheiro) e mensuração de perdas por taxas e descontos.',
    category: 'FINANCIAL',
    icon: 'fa-regular fa-credit-card',
    route: '/reports/financial/billing-payment-methods',
    badge: 'Financeiro',
    tags: ['cartao', 'pix', 'taxas', 'descontos', 'faturamento', 'recebimentos', 'pagamento'],
    isAvailable: true
  },
  {
    id: 'sales-performance',
    title: 'Desempenho de Vendas',
    description: 'Procedimentos e produtos mais vendidos, ticket médio e performance de conversão do catálogo.',
    category: 'OPERATIONAL',
    icon: 'fa-solid fa-bag-shopping',
    badge: 'Em Breve',
    tags: ['vendas', 'produtos', 'servicos', 'ticket medio'],
    isAvailable: false
  },
  {
    id: 'productivity-occupancy',
    title: 'Produtividade e Ocupação de Agenda',
    description: 'Taxa de ocupação dos consultórios, volume de atendimentos concluídos e índice de absenteísmo (no-show).',
    category: 'OPERATIONAL',
    icon: 'fa-regular fa-calendar-check',
    badge: 'Em Breve',
    tags: ['agenda', 'ocupacao', 'no-show', 'profissionais', 'produtividade'],
    isAvailable: false
  },
  {
    id: 'client-satisfaction-nps',
    title: 'Satisfação de Clientes (NPS)',
    description: 'Percepção de qualidade através de promotores, neutros, detratores e comentários sobre atendimentos.',
    category: 'CLIENTS',
    icon: 'fa-regular fa-face-smile',
    badge: 'Em Breve',
    tags: ['nps', 'feedback', 'satisfacao', 'promotores', 'avaliacoes'],
    isAvailable: false
  }
];
