'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shortcut para admin (desarrollo)
  const fillAdmin = () => {
    setFormData({
      email: 'admin@admin.com',
      password: 'admin',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // Redirigir a mi-espacio después del login
      router.push('/mi-espacio');
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
          <p className="text-gray-400">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50"
              placeholder="tu@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {/* Shortcut Admin (solo desarrollo) */}
          <button
            type="button"
            onClick={fillAdmin}
            className="w-full text-xs text-gray-500 hover:text-neon-green transition-colors"
          >
            🔧 Usar cuenta admin (desarrollo)
          </button>

          {/* Links */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/create-profile" className="text-neon-green hover:brightness-110">
                Regístrate aquí
              </Link>
            </p>
            <Link href="/" className="block text-sm text-gray-500 hover:text-gray-300">
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
