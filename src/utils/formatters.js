export const formatDate = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
        const [year, month, day] = dateString.trim().split('-');
        return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateOnly = formatDate;

export const formatShortName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
};

export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const round2 = (val) => Math.round((val || 0) * 100) / 100;


export const formatPhone = (value) => {
    if (!value) return '';
    let numericValue = value.replace(/\D/g, '');

    // Se vier com o DDI 55 (Brasil) e tiver 12 ou 13 dígitos, remove o 55 para formatar (DDD) Número
    if (numericValue.startsWith('55') && (numericValue.length === 12 || numericValue.length === 13)) {
        numericValue = numericValue.substring(2);
    }

    if (numericValue.length === 11) {
        return `(${numericValue.substring(0, 2)}) ${numericValue.substring(2, 7)}-${numericValue.substring(7)}`;
    }
    if (numericValue.length === 10) {
        return `(${numericValue.substring(0, 2)}) ${numericValue.substring(2, 6)}-${numericValue.substring(6)}`;
    }
    if (numericValue.length > 2 && numericValue.length < 10) {
        return `(${numericValue.substring(0, 2)}) ${numericValue.substring(2)}`;
    }
    return numericValue;
};
