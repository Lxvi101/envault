import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/stores/useAuthStore';
import { lockScreenVariants, fadeInUp } from '@/components/motion/variants';
import { MasterPasswordInput } from './MasterPasswordInput';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';

type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

interface StrengthConfig {
  label: string;
  color: string;
  width: string;
}

const strengthConfigs: Record<PasswordStrength, StrengthConfig> = {
  weak: { label: 'Weak', color: 'bg-vault-danger', width: 'w-1/4' },
  fair: { label: 'Fair', color: 'bg-vault-warning', width: 'w-2/4' },
  strong: { label: 'Strong', color: 'bg-vault-accent', width: 'w-3/4' },
  'very-strong': { label: 'Very Strong', color: 'bg-vault-success', width: 'w-full' },
};

function evaluateStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 1) return 'weak';
  if (score <= 2) return 'fair';
  if (score <= 4) return 'strong';
  return 'very-strong';
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = evaluateStrength(password);
  const config = strengthConfigs[strength];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-1.5"
    >
      <div className="h-1.5 bg-vault-raised rounded-full overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', config.color)}
          initial={{ width: 0 }}
          animate={{ width: config.width === 'w-full' ? '100%' : config.width === 'w-3/4' ? '75%' : config.width === 'w-2/4' ? '50%' : '25%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="text-xs text-vault-muted">
        Password strength: <span className="text-vault-text font-medium">{config.label}</span>
      </p>
    </motion.div>
  );
}

const stepVariants = {
  initial: { opacity: 0, x: 40, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -40,
    filter: 'blur(4px)',
    transition: { duration: 0.25 },
  },
};

export function SetupWizard() {
  const { setup, isLoading, error } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState(false);

  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = password === confirmPassword;

  const handleContinue = useCallback(() => {
    if (isPasswordValid) {
      setStep(2);
    }
  }, [isPasswordValid]);

  const handleCreate = useCallback(async () => {
    if (!passwordsMatch) {
      setConfirmError(true);
      return;
    }
    await setup(password);
  }, [password, passwordsMatch, setup]);

  const handleConfirmChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      if (confirmError) setConfirmError(false);
    },
    [confirmError],
  );

  const orbs = useMemo(
    () => [
      { delay: 0, x: '10%', y: '25%', size: 280 },
      { delay: 2.5, x: '75%', y: '10%', size: 220 },
      { delay: 1.5, x: '60%', y: '65%', size: 320 },
      { delay: 3, x: '20%', y: '80%', size: 240 },
    ],
    [],
  );

  return (
    <motion.div
      variants={lockScreenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 40% 30%, rgba(0,102,204,0.06) 0%, transparent 50%), radial-gradient(ellipse at 60% 70%, rgba(99,102,241,0.04) 0%, transparent 50%)',
          }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: 'radial-gradient(circle, rgba(0,102,204,0.06) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              y: [0, -25, 0, 18, 0],
              x: [0, 12, -8, 15, 0],
              opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
            }}
            transition={{
              duration: 14,
              delay: orb.delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className={clsx(
            'rounded-2xl p-8',
            'bg-white/80 backdrop-blur-xl',
            'border border-vault-border',
            'shadow-xl shadow-black/5',
          )}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={clsx(
                'w-2 h-2 rounded-full transition-colors duration-300',
                step >= 1 ? 'bg-vault-accent' : 'bg-vault-border',
              )}
            />
            <div className="w-8 h-px bg-vault-border" />
            <div
              className={clsx(
                'w-2 h-2 rounded-full transition-colors duration-300',
                step >= 2 ? 'bg-vault-accent' : 'bg-vault-border',
              )}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-vault-accent flex items-center justify-center shadow-lg shadow-vault-accent/20">
                    <Shield size={32} className="text-white" />
                  </div>
                </div>

                <h1 className="text-center mb-1">
                  <span className="text-2xl font-bold text-vault-text">
                    Welcome to {APP_NAME}
                  </span>
                </h1>
                <p className="text-center text-vault-muted text-sm mb-8">{APP_TAGLINE}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 text-sm text-vault-muted">
                    <Lock size={16} className="text-vault-accent mt-0.5 shrink-0" />
                    <p>Your environment variables are encrypted with AES-256-GCM using your master password.</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-vault-muted">
                    <Shield size={16} className="text-vault-accent mt-0.5 shrink-0" />
                    <p>
                      Your password never leaves this device. If you forget it, your vault cannot be
                      recovered.
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className={clsx(
                    'w-full py-3 rounded-xl font-medium text-sm',
                    'bg-vault-accent text-white',
                    'shadow-lg shadow-vault-accent/20',
                    'hover:bg-vault-accent-hover transition-colors',
                    'flex items-center justify-center gap-2',
                  )}
                >
                  Get Started
                  <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-vault-surface flex items-center justify-center border border-vault-border">
                    <Lock size={24} className="text-vault-accent" />
                  </div>
                </div>

                <h2 className="text-center text-lg font-semibold text-vault-text mb-1">
                  Create Master Password
                </h2>
                <p className="text-center text-vault-muted text-sm mb-6">
                  This password encrypts all your secrets. Make it strong.
                </p>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <MasterPasswordInput
                      value={password}
                      onChange={setPassword}
                      onSubmit={handleContinue}
                      placeholder="Create master password"
                    />
                    <PasswordStrengthBar password={password} />
                  </div>

                  <MasterPasswordInput
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    onSubmit={handleCreate}
                    placeholder="Confirm master password"
                    error={confirmError}
                    autoFocus={false}
                  />

                  {confirmError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-vault-danger text-sm text-center"
                    >
                      Passwords do not match
                    </motion.p>
                  )}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-vault-danger text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className={clsx(
                        'px-4 py-3 rounded-xl font-medium text-sm',
                        'bg-vault-surface text-vault-muted',
                        'border border-vault-border',
                        'hover:text-vault-text transition-colors duration-150',
                      )}
                    >
                      Back
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreate}
                      disabled={!isPasswordValid || !confirmPassword || isLoading}
                      className={clsx(
                        'flex-1 py-3 rounded-xl font-medium text-sm',
                        'bg-vault-accent text-white',
                        'shadow-lg shadow-vault-accent/20',
                        'hover:bg-vault-accent-hover transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center justify-center gap-2',
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating Vault...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Create Vault
                        </>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-xs text-vault-muted text-center">
                    Minimum {MIN_PASSWORD_LENGTH} characters required
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
