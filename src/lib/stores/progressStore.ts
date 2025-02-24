import { writable } from 'svelte/store';

interface ProgressState {
    isVisible: boolean;
    value: number;
    label: string;
    isCompleted: boolean;
}

const initialState: ProgressState = {
    isVisible: false,
    value: 0,
    label: 'Φόρτωση...',
    isCompleted: false
};

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function createProgressStore() {
    const { subscribe, set, update } = writable<ProgressState>(initialState);

    return {
        subscribe,
        
        // Ξεκινάει τη διαδικασία προόδου
        startProgress: async (label = 'Φόρτωση...') => {
            // Αρχικοποίηση
            set({
                isVisible: true,
                value: 0,
                label,
                isCompleted: false
            });
            
            // Αρχική καθυστέρηση για ομαλότερη εμφάνιση
            await wait(150);
            
            // Προσομοίωση προόδου με πιο ομαλές μεταβάσεις
            // Γρήγορη αρχική πρόοδος μέχρι 40%
            for (let i = 0; i <= 40; i += 5) {
                update(state => ({ ...state, value: i }));
                await wait(80);
            }
            
            // Μεσαία πρόοδος λίγο πιο αργά (40% - 75%)
            for (let i = 45; i <= 75; i += 3) {
                update(state => ({ ...state, value: i }));
                await wait(100);
            }
            
            // Αργή τελική πρόοδος (75% - 95%)
            for (let i = 78; i <= 95; i += 2) {
                update(state => ({ ...state, value: i }));
                await wait(120);
            }
            
            // Παραμένει στο 95% μέχρι να κληθεί το completeProgress()
        },
        
        // Ολοκληρώνει τη διαδικασία προόδου
        completeProgress: (hideDelay = 800) => {
            update(state => ({
                ...state,
                value: 100,
                isCompleted: true
            }));
            
            // Κρύψιμο του progress bar μετά από την καθορισμένη καθυστέρηση
            setTimeout(() => {
                update(state => ({ ...state, isVisible: false }));
            }, hideDelay);
        },
        
        // Ακυρώνει και επαναφέρει την πρόοδο
        resetProgress: () => set(initialState)
    };
}

export const progressStore = createProgressStore();