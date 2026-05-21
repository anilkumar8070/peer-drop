import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiShield, FiCpu, FiArrowRight } from 'react-icons/fi';

export default function Home() {
    const navigate = useNavigate();

    const startSharing = () => {
        // Generate a 6-digit random room code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        navigate(`/room/${code}`);
    };

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
                <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    How it works
                </button>
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
                </motion.div>

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