import { useEscapeKey } from './useEscapeKey';

export function useModal(emit) {
    useEscapeKey(() => emit('close'));
}
