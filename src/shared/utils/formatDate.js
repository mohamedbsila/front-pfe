export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getCurrentYear() {
    return new Date().getFullYear();
}

export function parseProFloat(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const clean = str.toString().replace(/\s/g, '').replace(/,/g, '.');
    return parseFloat(clean) || 0;
}