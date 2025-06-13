import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TokenTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: string; // e.g., 'meditation', 'purchase', 'reward'
  timestamp: string;
}

interface TokenState {
  balance: number;
  transactions: TokenTransaction[];
  
  // Actions
  addTokens: (amount: number, source: string) => void;
  spendTokens: (amount: number, source: string) => boolean; // Returns success status
  getTransactionHistory: () => TokenTransaction[];
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      
      addTokens: (amount, source) => {
        if (amount <= 0) return;
        
        const newTransaction: TokenTransaction = {
          id: Date.now().toString(),
          amount,
          type: 'earned',
          source,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          balance: state.balance + amount,
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      
      spendTokens: (amount, source) => {
        const { balance } = get();
        
        // Check if user has enough tokens
        if (balance < amount) {
          return false;
        }
        
        const newTransaction: TokenTransaction = {
          id: Date.now().toString(),
          amount,
          type: 'spent',
          source,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          balance: state.balance - amount,
          transactions: [newTransaction, ...state.transactions],
        }));
        
        return true;
      },
      
      getTransactionHistory: () => {
        return get().transactions;
      },
    }),
    {
      name: 'token-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);