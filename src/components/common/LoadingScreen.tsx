"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface LoadingScreenProps {
    delay?: number;
    minimumDisplayTime?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    delay = 0,
    minimumDisplayTime = 800
}) => {
    const [show, setShow] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, delay + minimumDisplayTime);

        return () => clearTimeout(timer);
    }, [delay, minimumDisplayTime]);

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#f8f9ef] flex items-center justify-center z-50"
        >
            <div className="flex flex-col items-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                    className="mb-4"
                >
                    <Logo />
                </motion.div>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                    className="h-1 bg-gradient-to-r from-[#E50046] to-pink-400 rounded-full"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-gray-600"
                >
                    Loading your habits...
                </motion.p>
            </div>
        </motion.div>
    );
};

export default LoadingScreen; 