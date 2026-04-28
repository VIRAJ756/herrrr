export type ContactRelation = "family" | "friend" | "colleague";

export type Contact = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string | null;
  relation: ContactRelation;
  isActive: boolean;
};

