export type DisabledSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: null } }>;
  };
};

// Frontend auth is disabled for the local SQLite build.
export const supabase: DisabledSupabaseClient = {
  auth: {
    async getSession() {
      return { data: { session: null } };
    },
  },
};

