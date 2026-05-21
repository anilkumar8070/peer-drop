import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { usePeerStore } from '../store/usePeerStore';

// Change this to your backend URL in production
const socket = io('http://localhost:5000');

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
    const receiverBuffer = useRef([]);
    const currentFileMeta = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        // 1. Join the socket room
        socket.emit('join-room', roomId);

        // 2. Listen for other users
        socket.on('user-joined', (userId) => {
            console.log("User joined, initiating offer...");
            initiatePeer(userId, true); // We are the initiator (sender)
        });

        socket.on('signal', ({ senderId, signal }) => {
            console.log("Received signal from peer");
            if (!peerRef.current) {
                initiatePeer(senderId, false); // We are the receiver
            }
            peerRef.current.signal(signal);
        });

        return () => {
            socket.off('user-joined');
            socket.off('signal');
            if (peerRef.current) peerRef.current.destroy();
        };
    }, [roomId]);

    const initiatePeer = (targetId, isInitiator) => {
        const peer = new Peer({
            initiator: isInitiator,
            trickle: false,
            // Configuration for NAT traversal (STUN servers)
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data) => {
            socket.emit('signal', { targetId, signal: data });
        });

        peer.on('connect', () => {
            setConnectionStatus('connected');
            setConnectedUser(targetId);
            console.log("P2P Connected!");
        });

        // 3. Handle Incoming Data (Files or Metadata)
        peer.on('data', (data) => {
            handleIncomingData(data);
        });

        peer.on('close', () => {
            setConnectionStatus('disconnected');
        });

        peerRef.current = peer;
    };

    // --- FILE SENDING LOGIC ---
    const sendFile = (file) => {
        if (!peerRef.current) return;

        // First, send file metadata as a JSON string
        const meta = {
            type: 'metadata',
            name: file.name,
            size: file.size,
            fileType: file.type
        };
        peerRef.current.send(JSON.stringify(meta));

        // Start reading and sending file in chunks
        const reader = new FileReader();
        let offset = 0;

        reader.onload = (e) => {
            peerRef.current.send(e.target.result);
            offset += e.target.result.byteLength;
            
            const progress = Math.round((offset / file.size) * 100);
            updateProgress(progress);

            if (offset < file.size) {
                readNextChunk();
            } else {
                console.log("File sent successfully");
                updateProgress(0); // Reset progress
            }
        };

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        readNextChunk();
    };

    // --- FILE RECEIVING LOGIC ---
    const handleIncomingData = (data) => {
        try {
            // Check if data is metadata (JSON string)
            const message = JSON.parse(data.toString());
            if (message.type === 'metadata') {
                currentFileMeta.current = message;
                receiverBuffer.current = []; // Clear buffer for new file
                return;
            }
        } catch (e) {
            // If not JSON, it's a binary file chunk
            receiverBuffer.current.push(data);
            
            // Calculate progress
            const receivedSize = receiverBuffer.current.reduce((acc, curr) => acc + curr.byteLength, 0);
            const progress = Math.round((receivedSize / currentFileMeta.current.size) * 100);
            updateProgress(progress);

            // If all chunks received
            if (receivedSize === currentFileMeta.current.size) {
                const blob = new Blob(receiverBuffer.current, { type: currentFileMeta.current.fileType });
                const url = URL.createObjectURL(blob);
                
                // Add to store so UI can show download button
                addFile({
                    ...currentFileMeta.current,
                    url: url,
                    date: new Date().toLocaleTimeString()
                });
                
                updateProgress(0);
                receiverBuffer.current = [];
            }
        }
    };

    return { sendFile };
};