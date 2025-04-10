import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const router = useRouter();
  const { status } = useSession();
  
  // If already authenticated, redirect to dashboard
  if (status === 'authenticated') {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo('Starting sign-in process...');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      setDebugInfo(`Sign-in result: ${JSON.stringify(result)}`);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setDebugInfo(`Error during sign-in: ${err.message}`);
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Bridge</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In to Bridge</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="********"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            {/* Demo account info */}
            <div className="mt-4 text-sm text-gray-600 p-3 bg-gray-100 rounded">
              <p className="font-bold">Demo Account:</p>
              <p>Email: demo@bridge.com</p>
              <p>Password: password</p>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-800">
                Create Account
              </Link>
            </p>
          </div>
          
          {debugInfo && (
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-40">
              <p className="font-bold">Debug Info:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 