import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getUserScripts, createScript } from '@/services/scriptService';

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

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return getScripts(req, res, userId);
    case 'POST':
      return createNewScript(req, res, userId);
    default:
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
  }
}

// Get all scripts for the user
async function getScripts(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
  try {
    const scripts = await getUserScripts(userId);
    
    return res.status(200).json({
      success: true,
      data: scripts
    });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching scripts'
    });
  }
}

// Create a new script
async function createNewScript(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
  try {
    const { title, description = '', scenes = [] } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const newScript = await createScript({
      title,
      description,
      userId,
      scenes
    });

    return res.status(201).json({
      success: true,
      data: newScript
    });
  } catch (error) {
    console.error('Error creating script:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating script'
    });
  }
} 