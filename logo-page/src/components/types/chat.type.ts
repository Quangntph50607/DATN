import { KhuyenMaiTheoSanPham } from "./khuyenmai-type";

export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  responseType: ChatResponseType;
  message: string;
  products?: KhuyenMaiTheoSanPham[];
}

export type ChatResponseType =
  | "SEARCH"
  | "ADVICE"
  | "SHIPPING"
  | "FAQ"
  | "FOLLOW_UP"
  | "GENERAL"
  | "ERROR";
