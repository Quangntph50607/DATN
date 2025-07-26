"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const CallToActionBanner = () => {
    const handleCtaClick = () => {
        toast(
            <div>
                <div className="font-bold mb-1">🚧 Tính năng đang phát triển</div>
                <div>Tính năng này chưa được triển khai—nhưng đừng lo! Bạn có thể yêu cầu nó trong lời nhắc tiếp theo! 🚀</div>
            </div>
        );
    };

    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <Image
                    src="/images/photo-1583804227715-93acfe95fb37.jpg"
                    alt="Lego bricks background"
                    fill
                    className="object-cover"
                    priority={false}
                />
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white leading-tight">
                        Đừng Bỏ Lỡ Các Ưu Đãi <span className="text-yellow-400">Độc Quyền!</span>
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Đăng ký nhận bản tin của chúng tôi để cập nhật những bộ LEGO® mới nhất, các chương trình khuyến mãi hấp dẫn và nhiều bất ngờ khác!
                    </p>
                    <Button
                        size="lg"
                        className="bg-yellow-400 text-blue-800 hover:bg-yellow-500 px-10 py-8 text-xl font-bold rounded-full shadow-lg group"
                        onClick={handleCtaClick}
                    >
                        <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                        Đăng Ký Ngay
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToActionBanner; 