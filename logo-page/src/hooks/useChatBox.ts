import { useMutation } from "@tanstack/react-query";
import {
  ChatMessageRequest,
  ChatMessageResponse,
} from "@/components/types/chat.type";
import { chatbotService } from "@/services/chatService";

// gửi tin nhắn
export function useChatMessage() {
  return useMutation<ChatMessageResponse, Error, ChatMessageRequest>({
    mutationFn: (payload) => chatbotService.sendMessage(payload),
  });
}
