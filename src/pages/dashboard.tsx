import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ScriptEditor from '@/components/ScriptEditor';
import SceneManager from '@/components/SceneManager';
import { Script, Scene } from '@/services/scriptService';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch user's scripts
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchScripts();
    }
  }, [status, session]);

  // Fetch scripts from API
  const fetchScripts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scripts');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setScripts(data.data);
        
        // Load the first script if available and none is selected
        if (data.data.length > 0 && !currentScript) {
          await loadScript(data.data[0].id);
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
      setError('Could not load your scripts. Please try again or check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific script
  const loadScript = async (scriptId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scripts/${scriptId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentScript(data.data);
        
        // Select the first scene if available
        if (data.data.scenes.length > 0) {
          setCurrentSceneId(data.data.scenes[0].id);
        } else {
          setCurrentSceneId(null);
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to load script:', error);
      setError('Could not load the selected script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new script
  const createNewScript = async () => {
    setError(null);
    
    try {
      const title = prompt('Enter script title:');
      
      if (!title) return;
      
      setIsLoading(true);
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: '',
          scenes: [],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        await fetchScripts();
        await loadScript(data.data.id);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to create script:', error);
      setError('Could not create a new script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload script function
  const uploadScript = async () => {
    // Implementation for uploading script would go here
    alert('Upload script functionality coming soon');
  };

  // Update scenes in the current script
  const handleUpdateScenes = async (updatedScenes: Scene[]) => {
    if (!currentScript) return;
    
    setError(null);
    
    try {
      const response = await fetch(`/api/scripts/${currentScript.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentScript,
          scenes: updatedScenes,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentScript(data.data);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to update scenes:', error);
      setError('Could not update scenes. Please try again.');
    }
  };

  // Save scene content
  const handleSaveScene = async (content: string, sceneId: string) => {
    if (!currentScript) return;
    
    setError(null);
    
    const updatedScenes = currentScript.scenes.map(scene => {
      if (scene.id === sceneId) {
        return { ...scene, content };
      }
      return scene;
    });
    
    await handleUpdateScenes(updatedScenes);
  };

  // If loading or not authenticated
  if (status !== 'authenticated') {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-neutral-900">
        <div className="text-lg mb-6 text-neutral-300">Sign in to continue</div>
        <button
          onClick={() => signIn()}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Bridge - Dashboard</title>
        <meta name="description" content="Professional screenwriting platform" />
      </Head>
      
      <div className="min-h-screen bg-neutral-900 text-neutral-200">
        <header className="bg-black py-3 px-4 border-b border-neutral-800">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-normal tracking-wide text-white"><span className="text-neutral-400 mr-1">+</span>BRIDGE</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm">{session?.user?.name || session?.user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="text-neutral-400 hover:text-white text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto py-6 px-4">
          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-600 text-red-200 px-4 py-3 mb-6">
              <div className="flex">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loader"></div>
            </div>
          ) : scripts.length === 0 ? (
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="max-w-md w-full text-center">
                <h2 className="text-2xl font-light mb-6 text-white">No Scripts Found</h2>
                <p className="mb-10 text-neutral-500">Start by creating a new script or uploading an existing one.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={createNewScript}
                    className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white"
                  >
                    Create New Script
                  </button>
                  <button
                    onClick={uploadScript}
                    className="px-5 py-2 bg-transparent hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white"
                  >
                    Upload Script
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">Scripts</h2>
                    <button
                      onClick={createNewScript}
                      className="text-sm text-neutral-400 hover:text-white"
                    >
                      + New
                    </button>
                  </div>
                  <ul className="border border-neutral-800 divide-y divide-neutral-800">
                    {scripts.map((script) => (
                      <li 
                        key={script.id} 
                        className={`px-4 py-3 cursor-pointer hover:bg-neutral-800 transition-colors ${
                          currentScript?.id === script.id ? 'bg-neutral-800 border-l-2 border-white' : ''
                        }`}
                        onClick={() => script.id && loadScript(script.id)}
                      >
                        {script.title}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {currentScript && (
                  <div className="mb-6">
                    <SceneManager
                      initialScenes={currentScript.scenes}
                      onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
                      onUpdateScenes={handleUpdateScenes}
                    />
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-3">
                {currentScript && currentSceneId ? (
                  <div className="border border-neutral-800">
                    <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-800/50">
                      <div className="flex items-center">
                        <span className="text-neutral-400 text-sm uppercase tracking-wider mr-2">SCENE:</span>
                        <h3 className="text-base font-normal">
                          {currentScript.scenes.find(scene => scene.id === currentSceneId)?.title}
                        </h3>
                      </div>
                    </div>
                    <div className="bg-neutral-900">
                      <ScriptEditor
                        initialContent={
                          currentScript.scenes.find(scene => scene.id === currentSceneId)?.content || ''
                        }
                        sceneId={currentSceneId}
                        onSave={handleSaveScene}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border border-neutral-800 bg-neutral-900/30">
                    <div className="text-center px-4">
                      <p className="text-neutral-500">
                        {currentScript ? 'Select a scene to begin writing' : 'Select a script to begin'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <style jsx global>{`
        body {
          font-family: 'Courier New', monospace;
        }
        .loader {
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top: 3px solid #fff;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}