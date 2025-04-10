import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getScriptById, updateScript, deleteScript } from '@/services/scriptService';

type ResponseData = {
  success: boolean;
  data?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid script ID'
    });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getScript(req, res, id, userId);
    case 'PUT':
      return updateScriptHandler(req, res, id, userId);
    case 'DELETE':
      return deleteScriptHandler(req, res, id, userId);
    default:
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
  }
}

// Get a single script
async function getScript(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  scriptId: string,
  userId: string
) {
  try {
    const script = await getScriptById(scriptId, userId);
    
    if (!script) {
      return res.status(404).json({
        success: false,
        message: 'Script not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: script
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching script'
    });
  }
}

// Update a script
async function updateScriptHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  scriptId: string,
  userId: string
) {
  try {
    const { title, description, scenes } = req.body;
    
    const updatedScript = await updateScript(scriptId, { title, description, scenes }, userId);
    
    return res.status(200).json({
      success: true,
      data: updatedScript
    });
  } catch (error) {
    console.error('Error updating script:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating script'
    });
  }
}

// Delete a script
async function deleteScriptHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  scriptId: string,
  userId: string
) {
  try {
    await deleteScript(scriptId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Script deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting script:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting script'
    });
  }
} 