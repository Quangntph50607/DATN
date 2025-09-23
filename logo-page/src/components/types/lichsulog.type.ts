export interface LichSuLog {
  id: number;
  hanhDong: string;
  bang: string;
  moTa: string;
  thoiGian: number[];
  userId?: number | null;
  user?: {
    id: number;
    ten?: string | null;
    email?: string | null;
  } | null;
}
