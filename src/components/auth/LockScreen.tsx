import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/useAuthStore';
import { lockScreenVariants, fadeInUp } from '@/components/motion/variants';
import { MasterPasswordInput } from './MasterPasswordInput';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

function FloatingOrb({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 20, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.5, 0.8, 0.6, 0.7, 0.5],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    />
  );
}

export function LockScreen() {
  const { unlock, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (error) clearError();
      if (hasError) setHasError(false);
    },
    [error, hasError, clearError],
  );

  const handleUnlock = useCallback(async () => {
    if (!password || isLoading) return;
    const success = await unlock(password);
    if (!success) {
      setHasError(true);
      setPassword('');
    }
  }, [password, isLoading, unlock]);

  const orbs = useMemo(
    () => [
      { delay: 0, x: '15%', y: '20%', size: 300 },
      { delay: 2, x: '70%', y: '15%', size: 250 },
      { delay: 4, x: '50%', y: '60%', size: 350 },
      { delay: 1, x: '80%', y: '70%', size: 200 },
      { delay: 3, x: '25%', y: '75%', size: 280 },
    ],
    [],
  );

  return (
    <motion.div
      variants={lockScreenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-vault-bg overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [1, 0.8, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating orbs */}
        {orbs.map((orb, i) => (
          <FloatingOrb key={i} {...orb} />
        ))}

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Center card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className={clsx(
            'rounded-2xl p-8',
            'bg-vault-surface/60 backdrop-blur-xl',
            'border border-vault-border/50',
            'shadow-[0_0_80px_rgba(99,102,241,0.06)]',
          )}
        >
          {/* Shield icon with glow */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              animate={{
                filter: [
                  'drop-shadow(0 0 20px rgba(99,102,241,0.3))',
                  'drop-shadow(0 0 40px rgba(99,102,241,0.5))',
                  'drop-shadow(0 0 20px rgba(99,102,241,0.3))',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-accent to-purple-600 flex items-center justify-center">
                <Shield size={32} className="text-white" />
              </div>
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-center mb-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-vault-text via-vault-accent to-purple-400 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </h1>
          <p className="text-center text-vault-muted text-sm mb-8">{APP_TAGLINE}</p>

          {/* Password input */}
          <div className="space-y-4">
            <MasterPasswordInput
              value={password}
              onChange={handlePasswordChange}
              onSubmit={handleUnlock}
              error={hasError}
              disabled={isLoading}
            />

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-vault-danger text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Unlock button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnlock}
              disabled={isLoading || !password}
              className={clsx(
                'w-full py-3 rounded-xl font-medium text-sm',
                'bg-gradient-to-r from-vault-accent to-purple-600',
                'text-white shadow-lg shadow-vault-accent/20',
                'transition-all duration-200',
                'hover:shadow-xl hover:shadow-vault-accent/30',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-vault-accent/50 focus:ring-offset-2 focus:ring-offset-vault-bg',
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Unlocking...
                </span>
              ) : (
                'Unlock'
              )}
            </motion.button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-center text-vault-muted/50 text-xs mt-4">
          Press Enter to unlock
        </p>
      </motion.div>
    </motion.div>
  );
}
