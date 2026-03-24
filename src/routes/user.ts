import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Получить настройки пользователя
 *     description: Данные берутся на основе куки user_id
 *     responses:
 *       200:
 *         description: JSON с настройками
 */
router.get('/user', async (req: any, res) => {
  try {
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', req.userId).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "User not found" });
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

/**
 * @openapi
 * /api/user:
 *   post:
 *     summary: Обновить настройки пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base_currency:
 *                 type: string
 *                 example: "EUR"
 *               favorites:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["USD", "GBP"]
 *     responses:
 *       200:
 *         description: Обновленные данные
 */
router.post('/user', async (req: any, res) => {
  try {
    const { base_currency, favorites } = req.body;
    const { data, error } = await supabase.from('user_settings')
      .update({ base_currency, favorites, updated_at: new Date().toISOString() })
      .eq('user_id', req.userId).select().maybeSingle();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

export default router;