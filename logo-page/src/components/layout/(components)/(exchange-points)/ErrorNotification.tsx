import React from "react";
import { XCircle } from "lucide-react";

interface ErrorNotificationProps {
  isVisible: boolean;
  message: string;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  isVisible,
  message,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[9999]"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}
    >
      <div
        className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-xl shadow-2xl p-6 w-96 border border-red-600"
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-red-600 rounded-full">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-xl font-bold mb-2">Đổi phiếu thất bại</h3>
            <p className="text-red-100 text-base leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-red-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-red-400 to-red-300 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
