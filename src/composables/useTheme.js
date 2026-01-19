import { ref, watchEffect } from 'vue';

const THEME_KEY = 'githa-theme';

export function useTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const isDark = ref(storedTheme === 'dark');

    const toggleTheme = () => {
        isDark.value = !isDark.value;
    };

    watchEffect(() => {
        const theme = isDark.value ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    });

    return {
        isDark,
        toggleTheme
    };
}
