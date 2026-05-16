import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
dotenv.config();
const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),
    // Supabase (server)
    VITE_SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_KEY: z.string().min(1).optional(),
    // Google Gemini AI
    GEMINI_API_KEY: z.string().min(1).optional()
});
/** Load and validate server environment variables. */
export function loadEnv() {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
        const message = parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        throw new Error(`Invalid environment. ${message}`);
    }
    return parsed.data;
}
