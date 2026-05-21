import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FiArrowLeft, FiCopy, FiCheck, FiDownload, FiFile, FiShare2, FiActivity } from 'react-icons/fi';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePeerStore } from '../store/usePeerStore';

export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { sendFile } = useWebRTC(roomId);
    
    // Get state from Zustand
    const { connectionStatus, files, transferProgress, connectedUser } = usePeerStore();
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onFileDrop = (e) => {
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            sendFile(droppedFiles[0]);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-600/10 blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <FiArrowLeft /> Back to Home
                    </button>
                    
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className="text-sm font-medium capitalize">{connectionStatus}</span>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Connection Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                            <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Invite Peer</h2>
                            <div className="bg-black/40 p-4 rounded-2xl flex items-center justify-between mb-6 border border-white/5">
                                <span className="font-mono text-xl font-bold text-blue-400">{roomId}</span>
                                <button onClick={copyLink} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                    {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
                                </button>
                            </div>

                            <div className="bg-white p-4 rounded-2xl w-fit mx-auto mb-6">
                                <QRCodeSVG value={window.location.href} size={160} level="H" />
                            </div>
                            
                            <p className="text-center text-gray-500 text-sm leading-relaxed">
                                Scan this QR code with another device or share the room link to start transferring.
                            </p>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                    <FiActivity />
                                </div>
                                <div>
                                    <h3 className="font-bold">Peer Status</h3>
                                    <p className="text-sm text-gray-500">
                                        {connectionStatus === 'connected' ? 'Device Linked' : 'Waiting for connection...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transfer Area */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Drag & Drop Zone */}
                        <motion.div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onFileDrop}
                            whileHover={{ borderColor: connectionStatus === 'connected' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.2)' }}
                            className={`relative group border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center min-h-[350px] transition-all ${
                                connectionStatus === 'connected' 
                                ? 'border-white/10 bg-white/[0.02]' 
                                : 'border-red-500/20 bg-red-500/[0.02]'
                            }`}
                        >
                            <input 
                                type="file" 
                                className={`absolute inset-0 opacity-0 ${connectionStatus === 'connected' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onChange={(e) => e.target.files[0] && sendFile(e.target.files[0])}
                                disabled={connectionStatus !== 'connected'}
                            />
                            
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform ${
                                connectionStatus === 'connected' 
                                ? 'bg-blue-500/10 group-hover:scale-110' 
                                : 'bg-red-500/10'
                            }`}>
                                <FiShare2 className={`text-3xl ${connectionStatus === 'connected' ? 'text-blue-400' : 'text-red-400'}`} />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-2">
                                {connectionStatus === 'connected' 
                                    ? 'Drop file to send' 
                                    : connectionStatus === 'connecting' 
                                        ? 'Attempting to link devices...' 
                                        : 'Connection lost. Please refresh.'}
                            </h3>
                            <p className="text-gray-500">
                                {connectionStatus === 'connected' 
                                    ? 'Any file size. Encrypted. Direct.' 
                                    : 'Make sure the other person has the same room open.'}
                            </p>

                            {/* Progress Overlay */}
                            <AnimatePresence>
                                {transferProgress > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center p-12"
                                    >
                                        <div className="w-full max-w-md bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                                            <motion.div 
                                                className="h-full bg-blue-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${transferProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-2xl font-bold">{transferProgress}%</span>
                                        <span className="text-gray-400 mt-2">Transferring file...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Received Files List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FiFile className="text-blue-400" /> Received Files
                            </h3>
                            
                            <AnimatePresence>
                                {files.length === 0 ? (
                                    <p className="text-gray-600 italic">No files received yet.</p>
                                ) : (
                                    files.map((file, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <FiFile className="text-xl text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <a 
                                                href={file.url} 
                                                download={file.name}
                                                className="p-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                <FiDownload />
                                            </a>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}