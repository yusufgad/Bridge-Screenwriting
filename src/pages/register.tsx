import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { signIn } from 'next-auth/react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile to add display name
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }
      
      // Automatically sign in with NextAuth after registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        console.error('Error signing in after registration:', result.error);
        setError('Account created but could not sign in automatically. Please sign in manually.');
        router.push('/');
      } else {
        // Successful sign-in - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - Bridge</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your Name"
              />
            </div>
            
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
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p>
              Already have an account?{' '}
              <Link href="/" className="text-primary-600 hover:text-primary-800">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 