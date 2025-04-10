import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScene {
  id: string;
  title: string;
  content: string;
  characters: string[];
  isBridgeScene?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScript extends Document {
  title: string;
  description?: string;
  userId: string;
  scenes: IScene[];
  createdAt: Date;
  updatedAt: Date;
}

const SceneSchema = new Schema<IScene>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    characters: { type: [String], default: [] },
    isBridgeScene: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ScriptSchema = new Schema<IScript>(
  {
    title: { type: String, required: true },
    description: { type: String },
    userId: { type: String, required: true, index: true },
    scenes: { type: [SceneSchema], default: [] },
  },
  { timestamps: true }
);

// Check if the model already exists before defining it
// This helps when hot reloading in development
const Script: Model<IScript> = mongoose.models.Script || mongoose.model<IScript>('Script', ScriptSchema);

export default Script; 