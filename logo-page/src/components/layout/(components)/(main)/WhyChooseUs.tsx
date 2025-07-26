"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Truck, ShieldCheck, Gift } from 'lucide-react';

const WhyChooseUs = () => {
    const features = [
        {
            icon: Award,
            title: "Sản phẩm chính hãng",
            description: "Tất cả các bộ LEGO® đều được nhập khẩu chính hãng, đảm bảo chất lượng và an toàn tuyệt đối."
        },
        {
            icon: Truck,
            title: "Giao hàng siêu tốc",
            description: "Đơn hàng của bạn sẽ được giao đến tận tay nhanh chóng, an toàn trên toàn quốc."
        },
        {
            icon: ShieldCheck,
            title: "Bảo hành uy tín",
            description: "Chính sách bảo hành rõ ràng, hỗ trợ đổi trả linh hoạt để bạn yên tâm mua sắm."
        },
        {
            icon: Gift,
            title: "Ưu đãi hấp dẫn",
            description: "Luôn có những chương trình khuyến mãi, quà tặng đặc biệt dành cho khách hàng thân thiết."
        }
    ];

    return (
        <section className="py-20 bg-yellow-50 mt-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl lg:text-5xl font-black mb-4 text-blue-900">
                        Tại Sao Chọn <span className="gradient-text">LEGO MYKINGDOM</span>?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cam kết mang đến trải nghiệm mua sắm LEGO® tốt nhất cho bạn.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="icon-box"
                        >
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <feature.icon className="w-10 h-10 text-yellow-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-blue-800">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs; 