import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Swords, Zap, Crown, Flame, Star } from 'lucide-react';

const RANKS = ['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'];

const RANK_STYLES: Record<string, { 
  color: string; 
  glow: string; 
  icon: React.ReactNode;
  gradient: string;
}> = {
  'E-Rank': { 
    color: 'text-slate-400', 
    glow: 'shadow-slate-400/50',
    icon: <Shield className="h-16 w-16" />,
    gradient: 'from-slate-600 to-slate-800'
  },
  'D-Rank': { 
    color: 'text-emerald-400', 
    glow: 'shadow-emerald-400/50',
    icon: <Shield className="h-16 w-16" />,
    gradient: 'from-emerald-500 to-emerald-700'
  },
  'C-Rank': { 
    color: 'text-blue-400', 
    glow: 'shadow-blue-400/50',
    icon: <Swords className="h-16 w-16" />,
    gradient: 'from-blue-500 to-blue-700'
  },
  'B-Rank': { 
    color: 'text-violet-400', 
    glow: 'shadow-violet-400/50',
    icon: <Swords className="h-16 w-16" />,
    gradient: 'from-violet-500 to-violet-700'
  },
  'A-Rank': { 
    color: 'text-orange-400', 
    glow: 'shadow-orange-400/50',
    icon: <Zap className="h-16 w-16" />,
    gradient: 'from-orange-500 to-orange-700'
  },
  'S-Rank': { 
    color: 'text-red-400', 
    glow: 'shadow-red-400/50',
    icon: <Crown className="h-16 w-16" />,
    gradient: 'from-red-500 via-yellow-500 to-red-500'
  },
};

interface RankUpEvent {
  oldRank: string;
  newRank: string;
}

// Global event system for rank-up
type RankUpListener = (event: RankUpEvent) => void;
const rankUpListeners: RankUpListener[] = [];

// Queue system for showing intermediate rank-ups
let rankUpQueue: RankUpEvent[] = [];
let isProcessingQueue = false;

export const emitRankUp = (oldRank: string, newRank: string) => {
  const oldIndex = RANKS.indexOf(oldRank);
  const newIndex = RANKS.indexOf(newRank);
  
  // If jumping multiple ranks, queue intermediate animations
  if (newIndex > oldIndex + 1) {
    for (let i = oldIndex; i < newIndex; i++) {
      rankUpQueue.push({ oldRank: RANKS[i], newRank: RANKS[i + 1] });
    }
  } else {
    rankUpQueue.push({ oldRank, newRank });
  }
  
  // Start processing the queue if not already
  if (!isProcessingQueue) {
    processNextRankUp();
  }
};

const processNextRankUp = () => {
  if (rankUpQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  const event = rankUpQueue.shift()!;
  rankUpListeners.forEach(listener => listener(event));
};

export const onRankUp = (listener: RankUpListener) => {
  rankUpListeners.push(listener);
  return () => {
    const index = rankUpListeners.indexOf(listener);
    if (index > -1) rankUpListeners.splice(index, 1);
  };
};

export const RankUpAnimation = () => {
  const [rankUp, setRankUp] = useState<RankUpEvent | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const unsubscribe = onRankUp((event) => {
      setRankUp(event);
      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    });

    return unsubscribe;
  }, []);

  const handleClose = useCallback(() => {
    setRankUp(null);
    setParticles([]);
    // Process next rank-up in queue after a short delay
    setTimeout(() => {
      processNextRankUp();
    }, 300);
  }, []);

  useEffect(() => {
    if (rankUp) {
      const timer = setTimeout(handleClose, 3000); // Reduced to 3s for smoother queue
      return () => clearTimeout(timer);
    }
  }, [rankUp, handleClose]);

  if (!rankUp) return null;

  const style = RANK_STYLES[rankUp.newRank] || RANK_STYLES['E-Rank'];
  const oldStyle = RANK_STYLES[rankUp.oldRank] || RANK_STYLES['E-Rank'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Particle effects */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${style.gradient}`}
            initial={{ 
              x: '50vw', 
              y: '50vh',
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 2,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Main content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="relative text-center"
        >
          {/* Glow effect behind */}
          <motion.div
            className={`absolute inset-0 rounded-full blur-3xl bg-gradient-to-r ${style.gradient} opacity-50`}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ width: '300px', height: '300px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />

          {/* Rank icon with animation */}
          <motion.div
            className={`relative ${style.color}`}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {style.icon}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-3xl font-orbitron font-bold text-foreground"
          >
            RANK UP!
          </motion.h1>

          {/* Rank transition */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-4"
          >
            <span className={`text-2xl font-bold ${oldStyle.color}`}>
              {rankUp.oldRank}
            </span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Flame className="h-8 w-8 text-orange-500" />
            </motion.div>
            <span className={`text-3xl font-bold ${style.color} drop-shadow-lg`}>
              {rankUp.newRank}
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-muted-foreground font-rajdhani"
          >
            Your power has grown beyond limits!
          </motion.p>

          {/* Stars decoration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: 'spring' }}
            className="mt-6 flex justify-center gap-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                <Star className={`h-5 w-5 ${style.color} fill-current`} />
              </motion.div>
            ))}
          </motion.div>

          {/* Tap to close hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2 }}
            className="mt-8 text-xs text-muted-foreground"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
