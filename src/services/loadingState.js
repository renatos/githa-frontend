import { reactive } from 'vue';

export const loadingState = reactive({
    isLoading: false,

    setLoading(value) {
        this.isLoading = value;
    }
});
