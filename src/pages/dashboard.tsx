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
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-lg mb-4">Please sign in to use Bridge</div>
        <button
          onClick={() => signIn()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
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
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-primary-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Bridge</h1>
            
            <div className="flex items-center gap-4">
              <span>{session?.user?.name || session?.user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="bg-primary-700 hover:bg-primary-600 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 font-bold"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">My Scripts</h2>
            
            <button
              onClick={createNewScript}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
            >
              New Script
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center p-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : scripts.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-lg shadow">
              <p className="mb-4">You don't have any scripts yet.</p>
              <button
                onClick={createNewScript}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                Create Your First Script
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Your Scripts</h3>
                  <ul className="bg-white rounded-lg shadow divide-y">
                    {scripts.map((script) => (
                      <li 
                        key={script.id} 
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          currentScript?.id === script.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                        }`}
                        onClick={() => script.id && loadScript(script.id)}
                      >
                        {script.title}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {currentScript && (
                  <SceneManager
                    initialScenes={currentScript.scenes}
                    onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
                    onUpdateScenes={handleUpdateScenes}
                  />
                )}
              </div>
              
              <div className="lg:col-span-3">
                {currentScript && currentSceneId ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4">
                      {currentScript.title} - {
                        currentScript.scenes.find(scene => scene.id === currentSceneId)?.title
                      }
                    </h3>
                    
                    <ScriptEditor
                      initialContent={
                        currentScript.scenes.find(scene => scene.id === currentSceneId)?.content || ''
                      }
                      sceneId={currentSceneId}
                      onSave={handleSaveScene}
                    />
                  </>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    {currentScript ? (
                      <p>Select or create a scene to begin writing.</p>
                    ) : (
                      <p>Select or create a script to begin.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}