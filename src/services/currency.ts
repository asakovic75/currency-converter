import axios from 'axios';
import { supabase } from './supabase.js';

export const getCurrencyRates = async (base: string, targets: string[]) => {
  const API_KEY = process.env.EXCHANGE_API_KEY;
  const results: Record<string, number> = {};

  if (!API_KEY) {
    throw new Error("API Key отсутствует в файле .env");
  }

  for (const target of targets) {
    const { data: cached } = await supabase
      .from('rates_cache')
      .select('rate')
      .eq('base_code', base)
      .eq('target_code', target)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (cached) {
      results[target] = cached.rate;
    } else {
      try {
        const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${base}/${target}`;
        const resp = await axios.get(url);
        const rate = resp.data.conversion_rate;
        
        await supabase.from('rates_cache').insert({ base_code: base, target_code: target, rate });
        results[target] = rate;
      } catch (apiErr: any) {
        console.error(`[API Error for ${target}]:`, apiErr.response?.data || apiErr.message);
        results[target] = 0;
      }
    }
  }
  return results;
};