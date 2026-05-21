import { create } from 'zustand';

export const usePeerStore = create((set) => ({
    roomId: null,
    connectionStatus: 'idle', // 'idle' | 'connecting' | 'connected' | 'disconnected'
    peer: null,
    files: [],
    transferProgress: 0,
    connectedUser: null,

    // Actions
    setRoomId: (id) => set({ roomId: id }),
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setPeer: (peerInstance) => set({ peer: peerInstance }),
    setConnectedUser: (userId) => set({ connectedUser: userId }),
    
    addFile: (fileInfo) => set((state) => ({ 
        files: [...state.files, fileInfo] 
    })),
    
    updateProgress: (progress) => set({ transferProgress: progress }),
    
    resetStore: () => set({
        connectionStatus: 'idle',
        peer: null,
        transferProgress: 0,
        connectedUser: null
    })
}));