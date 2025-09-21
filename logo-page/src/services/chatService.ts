import {
  ChatMessageRequest,
  ChatMessageResponse,
} from "@/components/types/chat.type";
import { fetchWithAuth } from "./fetchWithAuth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const chatbotService = {
  // gửi chat
  async sendMessage(payload: ChatMessageRequest): Promise<ChatMessageResponse> {
    const res = await fetchWithAuth(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Không gửi được message (status: ${res.status})`);
    }

    return res.json();
  },
};
