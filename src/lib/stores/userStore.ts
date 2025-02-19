import { writable } from "svelte/store";
import type { User } from '$lib/types/database.types';

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isLoading: true,
    error: null
};

const createUserStore = () => {
    const { subscribe, set, update } = writable<UserState>(initialState);

    return {
        subscribe,
        setUser: (user: User | null) => update(state => ({...state, user, isLoading:false})),
        clearUser: () => set(initialState),
        setError: (error: string) => update(state => ({...state,error, isLoading: false})),
        setLoading: (isLoading: boolean) => update(state => ({...state, isLoading}))
    };

};

export const userStore = createUserStore();