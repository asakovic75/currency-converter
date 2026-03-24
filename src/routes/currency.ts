import { Router } from 'express';
import { getCurrencyRates } from '../services/currency.js';
import { supabase } from '../services/supabase.js';

const router = Router();
const memoryCache = new Map();

/**
 * @openapi
 * /api/currencies:
 *   get:
 *     summary: Список всех валют
 *     responses:
 *       200:
 *         description: Массив кодов валют
 */
router.get('/currencies', (req, res) => {
  res.json(['USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CNY', 'AED']);
});

/**
 * @openapi
 * /api/rates:
 *   get:
 *     summary: Получить курсы валют
 *     parameters:
 *       - name: targets
 *         in: query
 *         required: true
 *         schema: { type: string }
 *       - name: base
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Объект с курсами
 */
router.get('/rates', async (req: any, res) => {
  try {
    let { base, targets } = req.query;
    if (!targets) return res.status(400).json({ error: 'Targets required' });

    if (!base) {
      const { data } = await supabase.from('user_settings').select('base_currency').eq('user_id', req.userId).single();
      base = data?.base_currency || 'USD';
    }

    const cacheKey = `${req.userId}-${base}-${targets}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < 5 * 60 * 1000)) return res.json(cached.data);

    const targetList = (targets as string).split(',');
    const rates = await getCurrencyRates(base as string, targetList);
    
    const responseData = { base, rates };
    memoryCache.set(cacheKey, { data: responseData, time: Date.now() });
    
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

export default router;