import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessNotificationProps {
    isVisible: boolean;
    message: string;
    onClose: () => void;
}

export function SuccessNotification({ isVisible, message, onClose }: SuccessNotificationProps) {
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
            {/* Notification Card - hoàn toàn độc lập */}
            <div
                className="bg-blue-900 rounded-lg shadow-2xl p-6 w-80"
                style={{ pointerEvents: 'none' }}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex-shrink-0">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white text-lg font-medium">{message}</p>
                    </div>
                </div>

                {/* Progress bar tĩnh */}
                <div className="mt-4">
                    <div className="w-full bg-blue-700 rounded-full h-1">
                        <div className="bg-green-400 h-1 rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
} 