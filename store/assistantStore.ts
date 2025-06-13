import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIMessage, AIConversation } from '@/types';

interface AssistantState {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  isLoading: boolean;
  
  // Actions
  startNewConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  setCurrentConversation: (id: string) => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      
      startNewConversation: () => {
        const newConversation: AIConversation = {
          id: Date.now().toString(),
          messages: [],
          title: "New Conversation",
          lastUpdated: new Date().toISOString(),
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversation: newConversation,
        }));
      },
      
      sendMessage: async (content) => {
        const { currentConversation, conversations } = get();
        
        if (!currentConversation) {
          get().startNewConversation();
          return get().sendMessage(content);
        }
        
        // Add user message
        const userMessage: AIMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };
        
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, userMessage],
          lastUpdated: new Date().toISOString(),
        };
        
        // Update state with user message
        set({
          currentConversation: updatedConversation,
          conversations: conversations.map(c => 
            c.id === currentConversation.id ? updatedConversation : c
          ),
          isLoading: true,
        });
        
        try {
          // Enhanced system prompt with spiritual references and guidance style
          const systemPrompt = `You are a compassionate spiritual guide in the tradition of great teachers like Jesus, Buddha, and other wisdom traditions. 
          
          Provide guidance with:
          - Wisdom, compassion, and occasional humor
          - Metaphors, parables, and stories that illustrate spiritual concepts
          - References to teachings from various spiritual traditions when appropriate
          - Practical meditation advice tailored to the user's needs
          - Simple language that conveys deep concepts
          
          When suggesting meditation spaces or techniques, consider the user's emotional state and needs. Offer comfort during difficult times and gentle challenges for growth.
          
          Speak in a warm, present voice that makes the user feel heard and understood.`;
          
          // Prepare messages for AI API
          const messages = [
            { 
              role: 'system', 
              content: systemPrompt
            },
            ...updatedConversation.messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          ];
          
          // Call AI API (DeepSeek API integration would replace this)
          const response = await fetch('https://toolkit.rork.com/text/llm/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }
          
          const data = await response.json();
          
          // Add AI response
          const assistantMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.completion,
            timestamp: new Date().toISOString(),
          };
          
          const finalConversation = {
            ...updatedConversation,
            messages: [...updatedConversation.messages, assistantMessage],
            title: updatedConversation.messages.length === 0 
              ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
              : updatedConversation.title,
            lastUpdated: new Date().toISOString(),
          };
          
          // Update state with AI response
          set({
            currentConversation: finalConversation,
            conversations: get().conversations.map(c => 
              c.id === currentConversation.id ? finalConversation : c
            ),
            isLoading: false,
          });
        } catch (error) {
          console.error('Error getting AI response:', error);
          
          // Add error message
          const errorMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I'm sorry, I couldn't connect to my wisdom source at the moment. Please try again later.",
            timestamp: new Date().toISOString(),
          };
          
          const errorConversation = {
            ...updatedConversation,
            messages: [...updatedConversation.messages, errorMessage],
            lastUpdated: new Date().toISOString(),
          };
          
          set({
            currentConversation: errorConversation,
            conversations: get().conversations.map(c => 
              c.id === currentConversation.id ? errorConversation : c
            ),
            isLoading: false,
          });
        }
      },
      
      setCurrentConversation: (id) => {
        const { conversations } = get();
        const conversation = conversations.find(c => c.id === id);
        if (conversation) {
          set({ currentConversation: conversation });
        }
      },
    }),
    {
      name: 'assistant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);