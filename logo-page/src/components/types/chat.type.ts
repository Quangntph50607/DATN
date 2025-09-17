import { SanPham } from "./product.type";
// mở start
export interface ChatSessionResponse {
  sessionId: string;
  message: string;
}
// gửi request sau khi start
export interface ChatMessageRequest {
  message: string;
  sessionId: string;
}

// trả về response
export interface ChatMessageResponse {
  responseType: ChatResponseType;
  message: string;
  products?: SanPham[];
}

export type ChatResponseType =
  | "SEARCH"
  | "ADVICE"
  | "SHIPPING"
  | "FAQ"
  | "FOLLOW_UP"
  | "GENERAL"
  | "ERROR";
