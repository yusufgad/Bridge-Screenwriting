import { useState, useEffect } from 'react';
import { 
  Editor, 
  EditorState, 
  ContentState, 
  RichUtils, 
  convertToRaw, 
  convertFromRaw 
} from 'draft-js';

type ScriptEditorProps = {
  initialContent?: string;
  sceneId: string;
  onSave: (content: string, sceneId: string) => void;
};

const ScriptEditor = ({ initialContent, sceneId, onSave }: ScriptEditorProps) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState);
      } catch (e) {
        // If parsing fails, start with empty editor
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentRaw = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      onSave(contentRaw, sceneId);
    }, 1000);

    return () => clearTimeout(timer);
  }, [editorState, onSave, sceneId]);

  const handleKeyCommand = (command: string, state: EditorState) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Screenplay-specific formatting options
  const SceneHeadingButton = () => (
    <button 
      onClick={() => toggleBlockType('header-one')} 
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 mr-2"
    >
      Scene Heading
    </button>
  );

  const ActionButton = () => (
    <button 
      onClick={() => toggleBlockType('unstyled')} 
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 mr-2"
    >
      Action
    </button>
  );

  const CharacterButton = () => (
    <button 
      onClick={() => toggleBlockType('header-two')} 
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 mr-2"
    >
      Character
    </button>
  );

  const DialogueButton = () => (
    <button 
      onClick={() => toggleBlockType('blockquote')} 
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 mr-2"
    >
      Dialogue
    </button>
  );

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <SceneHeadingButton />
        <ActionButton />
        <CharacterButton />
        <DialogueButton />
        <button 
          onClick={() => toggleInlineStyle('BOLD')} 
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Bold
        </button>
        <button 
          onClick={() => toggleInlineStyle('ITALIC')} 
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Italic
        </button>
      </div>
      
      <div className="border p-4 min-h-[300px] font-mono">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          placeholder="Start writing your scene..."
        />
      </div>
    </div>
  );
};

export default ScriptEditor; 