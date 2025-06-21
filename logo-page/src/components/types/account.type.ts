// src/components/types/account.type.ts
export type Account = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status: string;
  avatar?: string;
  createdAt?: string;
};
