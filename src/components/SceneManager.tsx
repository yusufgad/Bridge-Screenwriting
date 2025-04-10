import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { generateSceneBridge } from '@/services/aiService';
import { Scene } from '@/services/scriptService';

type SceneManagerProps = {
  initialScenes?: Scene[];
  onSelectScene: (sceneId: string) => void;
  onUpdateScenes: (scenes: Scene[]) => void;
};

const SceneManager = ({ initialScenes = [], onSelectScene, onUpdateScenes }: SceneManagerProps) => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [isCreatingBridge, setIsCreatingBridge] = useState(false);

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: `New Scene ${scenes.length + 1}`,
      content: '',
      characters: [],
    };
    
    const updatedScenes = [...scenes, newScene];
    setScenes(updatedScenes);
    onUpdateScenes(updatedScenes);
    onSelectScene(newScene.id);
  };

  const handleDeleteScene = (sceneId: string) => {
    const updatedScenes = scenes.filter(scene => scene.id !== sceneId);
    setScenes(updatedScenes);
    onUpdateScenes(updatedScenes);
    
    if (updatedScenes.length > 0) {
      onSelectScene(updatedScenes[0].id);
    }
  };

  const handleSceneTitleChange = (sceneId: string, newTitle: string) => {
    const updatedScenes = scenes.map(scene => 
      scene.id === sceneId ? { ...scene, title: newTitle } : scene
    );
    setScenes(updatedScenes);
    onUpdateScenes(updatedScenes);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setScenes(items);
    onUpdateScenes(items);
  };

  const handleCreateBridge = async (index: number) => {
    if (index <= 0 || index >= scenes.length) return;
    
    setIsCreatingBridge(true);
    
    try {
      const previousScene = scenes[index - 1];
      const nextScene = scenes[index];
      
      // Combine all unique characters from both scenes
      const characters = Array.from(new Set([...(previousScene.characters || []), ...(nextScene.characters || [])]));
      
      const bridgeContent = await generateSceneBridge({
        previousScene: previousScene.content,
        nextScene: nextScene.content,
        characters,
      });
      
      const bridgeScene: Scene = {
        id: `bridge-${Date.now()}`,
        title: `Bridge: ${previousScene.title} → ${nextScene.title}`,
        content: bridgeContent,
        characters,
        isBridgeScene: true,
      };
      
      const updatedScenes = [
        ...scenes.slice(0, index),
        bridgeScene,
        ...scenes.slice(index),
      ];
      
      setScenes(updatedScenes);
      onUpdateScenes(updatedScenes);
      onSelectScene(bridgeScene.id);
    } catch (error) {
      console.error('Failed to create bridge scene:', error);
      // Here we would typically show an error message to the user
    } finally {
      setIsCreatingBridge(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Scenes</h2>
        <button 
          onClick={handleAddScene}
          className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
        >
          Add Scene
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="scenes">
          {(provided) => (
            <ul 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {scenes.map((scene, index) => (
                <Draggable key={scene.id} draggableId={scene.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`border rounded p-3 flex items-center justify-between ${
                        scene.isBridgeScene ? 'bg-secondary-50 border-secondary-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={scene.title}
                          onChange={(e) => handleSceneTitleChange(scene.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectScene(scene.id)}
                          className="text-gray-600 hover:text-primary-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {scenes.length > 1 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Create Bridge Scenes</h3>
          <div className="space-y-2">
            {scenes.map((scene, index) => {
              if (index === 0) return null;
              
              return (
                <div key={`bridge-${index}`} className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {scenes[index - 1].title} → {scene.title}
                  </span>
                  <button
                    onClick={() => handleCreateBridge(index)}
                    disabled={isCreatingBridge}
                    className="bg-secondary-600 text-white text-sm px-2 py-1 rounded hover:bg-secondary-700 disabled:opacity-50"
                  >
                    {isCreatingBridge ? 'Creating...' : 'Create Bridge'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneManager; 