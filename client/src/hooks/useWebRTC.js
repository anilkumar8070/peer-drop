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
    const hostPeerRef = useRef(null);
    const currentFileMeta = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        // Strategy: 
        // 1. Try to join as a client and connect to the roomId (host)
        // 2. Also try to become the HOST for this roomId
        
        const clientPeer = new Peer(null, {
            debug: 1,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        clientPeer.on('open', (id) => {
            console.log('Client Peer ID:', id);
            const conn = clientPeer.connect(roomId, { reliable: true });
            setupConnection(conn);
        });

        const hostPeer = new Peer(roomId, {
            debug: 1,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        hostPeer.on('connection', (conn) => {
            console.log('Incoming connection to HOST');
            setupConnection(conn);
        });

        peerRef.current = clientPeer;
        hostPeerRef.current = hostPeer;

        return () => {
            if (connRef.current) connRef.current.close();
            if (peerRef.current) peerRef.current.destroy();
            if (hostPeerRef.current) hostPeerRef.current.destroy();
        };
    }, [roomId]);

    const setupConnection = (conn) => {
        conn.on('open', () => {
            connRef.current = conn;
            setConnectionStatus('connected');
            setConnectedUser(conn.peer);
            console.log("Connected to peer!");
        });

        conn.on('data', (data) => {
            handleIncomingData(data);
        });

        conn.on('close', () => {
            setConnectionStatus('disconnected');
        });
    };

    const sendFile = (file) => {
        if (!connRef.current) return;

        // Send metadata
        connRef.current.send({
            type: 'metadata',
            name: file.name,
            size: file.size,
            fileType: file.type
        });

        // Send file
        connRef.current.send(file);
        
        updateProgress(100);
        setTimeout(() => updateProgress(0), 1000);
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