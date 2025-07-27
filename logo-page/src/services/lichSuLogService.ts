import { LichSuLog } from "@/components/types/lichsulog.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/lich-su-log";

export const lichSuLogService = {
  async getAllLogs(): Promise<LichSuLog[]> {
    const res = await fetchWithAuth(`${API_URL}/getAll`);
    if (!res.ok) throw new Error("Không tìm thấy lịch sử log");
    return await res.json();
  },

  async lichSuLogByBang(bang: string): Promise<LichSuLog[]> {
    const res = await fetchWithAuth(`${API_URL}/by-bang?bang=${bang}`);
    if (!res.ok) throw new Error(`Không có lịch sử log nào cho bảng ${bang}`);
    return await res.json();
  },
};
