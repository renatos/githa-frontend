import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authService } from '../services/authService'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { layout: 'auth', public: true }
        },
        {
            path: '/auth/google/callback',
            name: 'google-callback',
            component: () => import('../views/GoogleCallbackView.vue'),
            meta: { public: true }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/clients',
            name: 'clients',
            component: () => import('../views/ClientView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/strategic-clients',
            name: 'strategic-clients',
            component: () => import('../views/StrategicClientsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/parameters',
            name: 'system-parameters',
            component: () => import('../views/SystemParametersView.vue'),
            meta: { requiresAuth: true, roles: ['ADMIN'] }
        },
        {
            path: '/clients/:id',
            name: 'client-detail',
            component: () => import('../views/ClientDetailView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../views/UserView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/professionals',
            name: 'professionals',
            component: () => import('../views/ProfessionalView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/services',
            name: 'services',
            component: () => import('../views/ServiceView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/appointments',
            name: 'appointments',
            component: () => import('../views/AppointmentView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/financials',
            name: 'financials',
            component: () => import('../views/financial/FinancialDashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/account-groups',
            name: 'AccountGroups',
            component: () => import('../views/financial/AccountGroupList.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/payment-methods',
            name: 'PaymentMethods',
            component: () => import('../views/financial/PaymentMethodList.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/products',
            name: 'Products',
            component: () => import('../views/ProductList.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/accounts',
            name: 'accounts',
            component: () => import('../views/financial/AccountView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/feedbacks',
            name: 'feedbacks',
            component: () => import('../views/FeedbackView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/ai-insights',
            name: 'ai-insights',
            component: () => import('../views/AiCentralView.vue'),
            meta: { requiresAuth: true }
        },
        // Future routes: /clients, /professionals, etc.
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    // Public routes — always allow
    if (to.meta.public) {
        next();
        return;
    }

    // Authenticated redirect — if logged in, don't show login
    if (to.path === '/login' && token) {
        next('/');
        return;
    }

    // Protected routes — require token
    if (to.meta.requiresAuth && !token) {
        next('/login');
        return;
    }

    // Role-based access — check user roles
    if (to.meta.roles && to.meta.roles.length > 0) {
        const user = authService.getCurrentUser();
        const hasRole = to.meta.roles.some(role => user?.roles?.includes(role));
        if (!hasRole) {
            next('/');
            return;
        }
    }

    next();
});

// Handle dynamic import failures (e.g., after deploy with new asset hashes)
router.onError((error, to) => {
    if (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
    ) {
        window.location.href = to.fullPath;
    }
});

export default router

