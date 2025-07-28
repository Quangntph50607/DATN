import LuckyWheel from "@/components/layout/(components)/(main)/LuckyWheel";

export default function LuckyWheelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-800 mb-4">
                        🎰 Vòng Quay May Mắn 🎰
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Chào mừng bạn đến với vòng quay may mắn! Quay để nhận những voucher giảm giá hấp dẫn.
                        Mỗi người có 3 lượt quay mỗi ngày. Chúc bạn may mắn! 🍀
                    </p>
                </div>

                <LuckyWheel />

                <div className="mt-12 text-center">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-purple-800 mb-4">📋 Hướng dẫn</h2>
                        <div className="text-left space-y-2 text-gray-700">
                            <p>• <strong>50% OFF:</strong> Giảm giá 50% cho đơn hàng tiếp theo</p>
                            <p>• <strong>30% OFF:</strong> Giảm giá 30% cho đơn hàng tiếp theo</p>
                            <p>• <strong>20% OFF:</strong> Giảm giá 20% cho đơn hàng tiếp theo</p>
                            <p>• <strong>10% OFF:</strong> Giảm giá 10% cho đơn hàng tiếp theo</p>
                            <p>• <strong>5% OFF:</strong> Giảm giá 5% cho đơn hàng tiếp theo</p>
                            <p>• <strong>Try again:</strong> Chúc may mắn lần sau!</p>
                        </div>
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-800 font-medium">
                                ⚠️ Lưu ý: Voucher sẽ được tự động thêm vào tài khoản của bạn sau khi quay thành công!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 