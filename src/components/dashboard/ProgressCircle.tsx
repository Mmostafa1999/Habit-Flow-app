"use client";

import React, { useEffect, useState, useRef } from 'react';

interface ProgressCircleProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    percentage,
    size = 150,
    strokeWidth = 10,
    label = 'completed'
}) => {
    // State to track the current animated percentage
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    // Ref to store the animation frame ID for cleanup
    const animationRef = useRef<number | null>(null);
    // Ref to store the previous percentage for animation
    const prevPercentage = useRef(percentage);

    useEffect(() => {
        // Start from the current animated value or previous percentage
        const startValue = animatedPercentage || prevPercentage.current;
        const duration = 1000; // Animation duration in ms
        const startTime = performance.now();

        const animateProgress = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Easing function for smooth animation (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Calculate the new value based on progress
            const newValue = startValue + (percentage - startValue) * easedProgress;

            setAnimatedPercentage(newValue);

            if (progress < 1) {
                // Continue animation
                animationRef.current = requestAnimationFrame(animateProgress);
            } else {
                // Animation completed
                prevPercentage.current = percentage;
            }
        };

        // Start the animation
        animationRef.current = requestAnimationFrame(animateProgress);

        // Cleanup function to cancel animation on unmount or when percentage changes
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [percentage]);

    // Calculate SVG parameters
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg width={size} height={size} className="absolute">
                    <circle
                        className="text-gray-200"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                </svg>

                {/* Progress circle */}
                <svg width={size} height={size} className="absolute transform -rotate-90">
                    <circle
                        className="text-[#E50046]"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                </svg>

                {/* Percentage text */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{Math.round(animatedPercentage)}%</span>
                    <span className="text-xs text-gray-500 mt-1">{label}</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressCircle;   