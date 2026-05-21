import { useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { usePeerStore } from '../store/usePeerStore';

// WebRTC chunk size (64KB is optimal for most browsers)
const CHUNK_SIZE = 16384 * 4; 

export const useWebRTC = (roomId) => {
    const { 
        setConnectionStatus, 
        setConnectedUser, 
        updateProgress, 
        addFile 
    } = usePeerStore();
    
    const peerRef = useRef(null);
    const connRef = useRef(null);
    const currentFileMeta = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        setConnectionStatus('connecting');

        let peerInstance = null;

        const initializePeer = (isHost) => {
            const id = isHost ? roomId : null;
            const peer = new Peer(id, {
                debug: 1,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
            });

            peer.on('open', (id) => {
                console.log('Peer opened with ID:', id);
                if (!isHost) {
                    // We are a client, attempt to connect to the host (roomId)
                    const conn = peer.connect(roomId, { reliable: true });
                    setupConnection(conn);
                }
            });

            peer.on('connection', (conn) => {
                console.log('Incoming connection received');
                setupConnection(conn);
            });

            peer.on('error', (err) => {
                if (isHost && err.type === 'unavailable-id') {
                    console.log('Room ID taken, initializing as client...');
                    peer.destroy();
                    initializePeer(false); // Try again as a client
                } else {
                    console.error('Peer error:', err);
                    setConnectionStatus('disconnected');
                }
            });

            peerInstance = peer;
            peerRef.current = peer;
        };

        // Start by trying to be the host
        initializePeer(true);

        return () => {
            if (connRef.current) connRef.current.close();
            if (peerInstance) peerInstance.destroy();
        };
    }, [roomId]);

    const setupConnection = (conn) => {
        // Important: Close existing connection if any
        if (connRef.current) connRef.current.close();

        conn.on('open', () => {
            connRef.current = conn;
            setConnectionStatus('connected');
            setConnectedUser(conn.peer);
            console.log("Connected to peer:", conn.peer);
        });

        conn.on('data', (data) => {
            handleIncomingData(data);
        });

        conn.on('close', () => {
            setConnectionStatus('disconnected');
        });

        conn.on('error', (err) => {
            console.error("Connection error:", err);
        });
    };

    const sendFile = (file) => {
        if (!connRef.current || !file) return;

        console.log("Sending metadata for:", file.name);
        // Send metadata
        connRef.current.send({
            type: 'metadata',
            name: file.name,
            size: file.size,
            fileType: file.type
        });

        // Small delay to ensure metadata is processed
        setTimeout(() => {
            console.log("Sending file data...");
            connRef.current.send(file);
            updateProgress(100);
            setTimeout(() => updateProgress(0), 1500);
        }, 100);
    };

    const handleIncomingData = (data) => {
        if (data && data.type === 'metadata') {
            currentFileMeta.current = data;
            return;
        }

        if (data instanceof Blob || data instanceof ArrayBuffer) {
            const blob = data instanceof Blob ? data : new Blob([data]);
            const url = URL.createObjectURL(blob);
            
            addFile({
                ...currentFileMeta.current,
                url: url,
                date: new Date().toLocaleTimeString()
            });
            updateProgress(0);
        }
    };

    return { sendFile };
};