import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiZap, FiShield, FiCpu, FiArrowRight, FiDownload, FiCamera, FiX } from 'react-icons/fi';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Home() {
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef(null);

    const startSharing = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        navigate(`/room/${code}`);
    };

    const handleJoin = (e) => {
        if (e) e.preventDefault();
        if (roomCode.trim()) {
            navigate(`/room/${roomCode.toUpperCase()}`);
        }
    };

    useEffect(() => {
        if (showScanner && showJoinModal) {
            const scanner = new Html5QrcodeScanner("reader", { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            });

            scanner.render((decodedText) => {
                // Success callback
                const code = decodedText.includes('/room/') ? decodedText.split('/room/')[1] : decodedText;
                setRoomCode(code.toUpperCase());
                setShowScanner(false);
                scanner.clear();
                navigate(`/room/${code.toUpperCase()}`);
            }, (error) => {
                // Error callback (usually just noise)
            });

            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, [showScanner, showJoinModal, navigate]);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            {/* Animated Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    PEERDROP
                </div>
                <div className="flex gap-6">
                    <button 
                        onClick={() => setShowJoinModal(true)}
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <FiDownload /> Receive
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8">
                        Share files <br />
                        <span className="bg-gradient-to-b from-gray-200 to-gray-500 bg-clip-text text-transparent">
                            instantly & privately.
                        </span>
                    </h1>
                    
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Peer-to-peer file transfer directly between browsers. 
                        No servers, no storage, no limits. Just your data, moving fast.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startSharing}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.2)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Sharing <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowJoinModal(true)}
                            className="group relative px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:bg-white/10"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Receive Files <FiDownload className="group-hover:translate-y-1 transition-transform" />
                            </span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Join Modal */}
                <AnimatePresence>
                    {showJoinModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowJoinModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <button 
                                    onClick={() => setShowJoinModal(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
                                >
                                    <FiX size={24} />
                                </button>

                                <h2 className="text-2xl font-bold mb-6">Receive Files</h2>
                                
                                <form onSubmit={handleJoin} className="space-y-6">
                                    <div>
                                        <label className="block text-sm text-gray-500 mb-2 ml-1">Enter Room Code</label>
                                        <input 
                                            type="text" 
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value)}
                                            placeholder="E.G. X7A2B9"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-mono tracking-widest focus:outline-none focus:border-blue-500/50 transition-colors uppercase"
                                            maxLength={8}
                                        />
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-colors"
                                    >
                                        Join Room
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/5"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#0f0f0f] px-2 text-gray-500">Or Scan QR Code</span>
                                        </div>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={() => setShowScanner(!showScanner)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiCamera /> {showScanner ? "Close Scanner" : "Open Camera Scanner"}
                                    </button>

                                    {showScanner && (
                                        <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black aspect-square relative">
                                             <div id="reader" className="w-full h-full"></div>
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mt-32 w-full">
                    <FeatureCard 
                        icon={<FiZap />} 
                        title="Direct P2P" 
                        desc="Data travels straight from one device to another using WebRTC technology." 
                    />
                    <FeatureCard 
                        icon={<FiShield />} 
                        title="Zero Storage" 
                        desc="We never see your files. They are never uploaded to any server or cloud." 
                    />
                    <FeatureCard 
                        icon={<FiCpu />} 
                        title="End-to-End" 
                        desc="Your transfers are encrypted and secure by default within the browser." 
                    />
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors text-left group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}