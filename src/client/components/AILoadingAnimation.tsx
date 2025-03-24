// src/components/AILoadingAnimation.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Code, Layout } from 'lucide-react';

interface CodeLine {
    id: number;
    width: number;
}

export const AILoadingAnimation: React.FC = () => {
    // Animation variants for the code lines
    const codeLineVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.1
            }
        })
    };

    // Generate mock code lines with varying widths
    const codeLines: CodeLine[] = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        width: Math.floor(Math.random() * 60) + 40 // Random width between 40-100%
    }));

    return (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="max-w-md w-full">
                <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                    <div className="flex justify-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                duration: 0.6
                            }}
                            className="relative"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className="absolute inset-0 bg-blue-400 rounded-full filter blur-xl opacity-30"
                                style={{ width: '100%', height: '100%' }}
                            />
                            <div className="relative z-10 flex">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                >
                                    <BrainCircuit className="h-16 w-16 text-blue-600" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute top-0 right-0"
                                >
                                    <Sparkles className="h-6 w-6 text-yellow-500" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.h3
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-xl font-bold text-gray-900 mb-2"
                    >
                        Building Your Page
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center text-gray-600 mb-6"
                    >
                        Analyzing requirements and generating components
                    </motion.p>

                    <div className="mb-6">
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                            <Code className="h-4 w-4 text-gray-500 mr-2" />
                            <div className="text-xs text-gray-500">Generating code</div>
                        </div>

                        <div className="space-y-1">
                            {codeLines.map((line, index) => (
                                <motion.div
                                    key={line.id}
                                    custom={index}
                                    initial="hidden"
                                    animate="visible"
                                    variants={codeLineVariants}
                                    className="h-2 rounded bg-gray-300"
                                    style={{ width: `${line.width}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {['Component Analysis', 'Layout Creation', 'Style Generation'].map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + (i * 0.2) }}
                                className="bg-gray-100 p-2 rounded text-center border border-gray-200"
                            >
                                <div className="text-xs text-gray-700">{step}</div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        delay: i * 0.3
                                    }}
                                >
                                    {i === 0 && <BrainCircuit className="h-4 w-4 mx-auto mt-1 text-blue-600" />}
                                    {i === 1 && <Layout className="h-4 w-4 mx-auto mt-1 text-indigo-600" />}
                                    {i === 2 && <Sparkles className="h-4 w-4 mx-auto mt-1 text-amber-500" />}
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};