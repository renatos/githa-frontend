export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

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

export const formatPhone = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');

    // (DD) 99999-9999
    const truncated = numericValue.substring(0, 11);

    let formatted = '';
    if (truncated.length > 0) {
        formatted += '(' + truncated.substring(0, 2);
    }
    if (truncated.length > 2) {
        formatted += ') ' + truncated.substring(2, 7);
    }
    if (truncated.length > 7) {
        formatted += '-' + truncated.substring(7, 11);
    }
    return formatted;
};
