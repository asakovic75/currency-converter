import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let userId = req.cookies?.user_id;

  if (!userId) {
    userId = uuidv4();
    res.cookie('user_id', userId, { 
      httpOnly: true, 
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: '/' 
    });

    try {
      const now = new Date().toISOString();
      await supabase.from('user_settings').insert([{ 
        user_id: userId, 
        base_currency: 'USD', 
        favorites: [],
        created_at: now,
        updated_at: now
      }]);
      console.log('Новый пользователь создан:', userId);
    } catch (e) { console.error('Ошибка создания юзера:', e); }
  }

  (req as any).userId = userId;
  next();
};