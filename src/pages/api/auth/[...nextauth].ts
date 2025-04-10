import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        try {
          console.log('Attempting Firebase authentication');
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;
          console.log('Firebase auth successful:', user.uid);
          
          if (user) {
            return {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              image: user.photoURL,
            };
          }
          
          throw new Error('Failed to authenticate with Firebase');
        } catch (error: any) {
          console.error('Error signing in with Firebase:', error);
          
          // Map Firebase errors to more user-friendly messages
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error('Invalid email or password');
          } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed login attempts. Please try again later');
          } else if (error.code) {
            throw new Error(`Firebase error: ${error.code}`);
          }
          
          // For development, provide a demo account
          if (credentials.email === 'demo@bridge.com' && credentials.password === 'password') {
            console.log('Using demo account instead');
            return {
              id: 'demo-user-1',
              name: 'Demo User',
              email: 'demo@bridge.com',
            };
          }
          
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60
  },
  debug: true, // Enable debug mode for troubleshooting
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}); 