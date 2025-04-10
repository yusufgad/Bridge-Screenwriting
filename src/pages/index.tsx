import Head from 'next/head'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Bridge - AI-Powered Screenwriting</title>
        <meta name="description" content="Write screenplays non-linearly with AI assistance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-700 to-primary-900 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4">Bridge</h1>
            <p className="text-2xl mb-8">Write screenplays non-linearly with AI assistance</p>
            
            {session ? (
              <Link 
                href="/dashboard" 
                className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signin" 
                  className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white hover:bg-gray-100 text-secondary-600 font-bold py-3 px-6 rounded-lg border border-secondary-600 transition duration-300"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Non-linear Writing</h3>
                <p>Write scenes in any order, rearrange as needed, and let AI help connect them.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">AI Scene Bridging</h3>
                <p>Our AI creates transitional scenes to connect your existing content seamlessly.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Creative Enhancement</h3>
                <p>Get AI suggestions for dialogue, plot development, and character consistency.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
} 