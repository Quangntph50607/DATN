import { HangThanhLyItem } from "../components/types/hangthanhly.type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/hang-thanh-ly";

export const hangThanhLyService = {
  async getAll(): Promise<HangThanhLyItem[]> {
    const res = await fetchWithAuth(`${API_URL}/get-all`);
    if (!res.ok) {
      throw new Error("Không thể tải hàng thanh lý");
    }
    return res.json();
  },
};




