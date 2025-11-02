
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Загружаем переменные из корневого .env файла
dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is not defined in .env file");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
