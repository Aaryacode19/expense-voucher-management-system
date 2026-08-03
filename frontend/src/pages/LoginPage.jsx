import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Receipt, Lock, Mail, ArrowRight, User, Shield, Landmark, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('employee@abc.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  // Moving Particle Constellation Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes
    const particleCount = 55;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby nodes with subtle moving lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 130) * 0.18;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const prefillCredential = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      {/* 1. Continuously Moving Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern animate-move-grid pointer-events-none opacity-80" />

      {/* 2. Interactive Moving Particle Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* 3. Laser Sweep Line Animation */}
      <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-laser pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-xl bg-white text-black items-center justify-center font-black shadow-2xl mb-1">
            <Receipt size={26} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ABC Company</h1>
          <p className="text-xs text-zinc-400">Expense Voucher Management System</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="border-b border-zinc-800/80 pb-4">
            <h2 className="text-base font-bold text-white">Sign In</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Select a role credential or enter your organization account.</p>
          </div>

          {error && (
            <div className="bg-zinc-950/90 border border-red-900/60 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@abc.com"
                  className="py-3 pl-12 pr-4 w-full bg-zinc-950/90 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="py-3 pl-12 pr-4 w-full bg-zinc-950/90 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-4 shadow-xl"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Prefill Account Shortcuts */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center">
              Quick Prefill Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => prefillCredential('employee@abc.com')}
                className={`p-3 bg-zinc-950/90 border rounded-lg text-center transition ${email === 'employee@abc.com' ? 'border-zinc-400 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <User size={16} className="mx-auto text-zinc-400 mb-1" />
                <p className="text-[11px] font-bold text-zinc-200">Employee</p>
              </button>

              <button
                type="button"
                onClick={() => prefillCredential('director@abc.com')}
                className={`p-3 bg-zinc-950/90 border rounded-lg text-center transition ${email === 'director@abc.com' ? 'border-zinc-400 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <Shield size={16} className="mx-auto text-zinc-400 mb-1" />
                <p className="text-[11px] font-bold text-zinc-200">Director</p>
              </button>

              <button
                type="button"
                onClick={() => prefillCredential('accounts@abc.com')}
                className={`p-3 bg-zinc-950/90 border rounded-lg text-center transition ${email === 'accounts@abc.com' ? 'border-zinc-400 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <Landmark size={16} className="mx-auto text-zinc-400 mb-1" />
                <p className="text-[11px] font-bold text-zinc-200">Accounts</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
