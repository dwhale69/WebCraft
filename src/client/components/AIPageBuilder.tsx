// src/components/AIPageBuilder.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Code, FileCode, Layout, BrainCircuit, Loader, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAgent } from "agents/react";

// Define TypeScript interfaces
interface UploadedImage {
    id: string;
    name: string;
    url: string;
    file?: File;
    isUploading: boolean;
}

type GenerationStage = 'initializing' | 'analyzing' | 'designing' | 'generating' | 'finalizing';

interface PageBuilderProps {
    onSubmit: (layoutDefinition: any) => void;
}

interface MessageContent {
    type: string;
    [key: string]: any;
}

interface StatusMessage {
    type: string;
    status?: string;
    message: string;
}

export const AIPageBuilder: React.FC<PageBuilderProps> = ({ onSubmit }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [currentStage, setCurrentStage] = useState<GenerationStage>('initializing');
    const [layoutResult, setLayoutResult] = useState<Record<string, any> | null>(null);
    const [agentStatus, setAgentStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");

    // Connect to the layout-design-agent using the useAgent hook
    const agent = useAgent({
        agent: "layout-design-agent",
        name: "layout-design-client",
        onMessage: (message: { data: string }) => {
            try {
                const data = JSON.parse(message.data);
                console.log('Received message:', data);

                // Handle different message types
                if (data.type === "status") {
                    handleStatusUpdate(data as StatusMessage);
                } else if (data.type === "layout-result") {
                    handleLayoutResult(data.data);
                }
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        },
        onOpen: () => {
            console.log("Connection established with layout-design-agent");
            setAgentStatus("connected");
        },
        onClose: () => {
            console.log("Connection closed with layout-design-agent");
            setAgentStatus("disconnected");
        },
        onError: (error: any) => {
            console.error("Connection error:", error);
            setAgentStatus("error");
        }
    });

    // Handle status update messages
    const handleStatusUpdate = (data: StatusMessage): void => {
        setStatusMessage(data.message);

        // Update the current stage based on the status message
        if (data.message.includes('requirements') || data.message.includes('Analyzing')) {
            setCurrentStage('analyzing');
        } else if (data.message.includes('layout')) {
            setCurrentStage('designing');
        } else if (data.message.includes('component') || data.message.includes('Generating')) {
            setCurrentStage('generating');
        } else if (data.message.includes('Finalizing') || data.message.includes('completed')) {
            setCurrentStage('finalizing');
        }
    };

    // Handle layout result messages
    const handleLayoutResult = (data: Record<string, any>): void => {
        setLayoutResult(data);
        setIsLoading(false);
        onSubmit(data);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Filter out unsupported file types
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validFiles = files.filter((file: File) => supportedTypes.includes(file.type));

        // Alert if some files were filtered out
        if (validFiles.length < files.length) {
            alert(`${files.length - validFiles.length} file(s) were not added. Only JPG, JPEG, and PNG formats are supported.`);
        }

        if (validFiles.length === 0) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Create temporary local previews
        const tempImages = files.map(file => ({
            id: Math.random().toString(36).substring(2),
            name: file.name,
            url: URL.createObjectURL(file),
            file,
            isUploading: true
        }));

        // Add temp images for immediate display
        setUploadedImages(prev => [...prev, ...tempImages]);

        try {

            // @ts-ignore
            const uploadedResults: { id: string; name: string; url: any; isUploading: boolean; }[] = [];

            // @ts-ignore
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const data = await response.json();

                // @ts-ignore
                if (data.success && data.url) {
                    uploadedResults.push({
                        id: tempImages[i].id,
                        name: file.name,
                        // @ts-ignore
                        url: data.url,
                        isUploading: false
                    });
                }

                // Update progress
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }

            // Replace temp URLs with actual uploaded URLs
            setUploadedImages(prev =>
                prev.map(img => {
                    const uploaded = uploadedResults.find(u => u.id === img.id);
                    return uploaded || img;
                })
            );

        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload one or more images. Please try again.');

            // Remove failed uploads
            setUploadedImages(prev =>
                prev.filter(img => !img.isUploading)
            );
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeImage = (id: string) => {
        setUploadedImages(uploadedImages.filter(img => img.id !== id));
    };

    const handleSubmit = () => {
        if (!prompt.trim() || agentStatus !== "connected") return;

        setIsLoading(true);
        setStatusMessage('Starting page generation...');
        setCurrentStage('initializing');
        setLayoutResult(null);

        // Extract just the image URLs from the uploadedImages objects
        const imageUrls = uploadedImages.map(img => img.url);

        // Create the request payload with prompt and image URLs
        const payload: MessageContent = {
            type: "generate-layout",
            content: {
                prompt,
                images: imageUrls
            },
            timestamp: new Date().toISOString()
        };

        // Send the request through the useAgent hook
        agent.send(JSON.stringify(payload));
    };


    // Calculate progress percentage based on current stage
    const getProgressPercentage = (): number => {
        switch(currentStage) {
            case 'initializing': return 10;
            case 'analyzing': return 20;
            case 'designing': return 30;
            case 'generating': return 50;
            case 'finalizing': return 95;
            default: return 10;
        }
    };

    // Auto-reconnect if the agent gets disconnected during the generation process
    useEffect(() => {
        if (isLoading && agentStatus === "disconnected") {
            agent.reconnect();
            setAgentStatus("connecting");
        }
    }, [isLoading, agentStatus]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center mb-4"
                    >
                        <BrainCircuit className="h-10 w-10 mr-3 text-blue-600" />
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            AI-Agent WebPage Builder
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Describe your page design requirements, upload reference images if needed,
                        and our AI will generate a stunning web page layout for you.
                    </motion.p>

                    {/* Agent Status Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-4 flex items-center justify-center space-x-2"
                    >
                        <div className={`w-3 h-3 rounded-full ${
                            agentStatus === "connected" ? "bg-green-500" :
                                agentStatus === "connecting" ? "bg-yellow-500" :
                                    agentStatus === "error" ? "bg-red-500" :
                                        "bg-gray-500"
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">
                            Agent Status: {agentStatus}
                        </span>
                        {agentStatus !== "connected" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    agent.reconnect();
                                    setAgentStatus("connecting");
                                }}
                                disabled={agentStatus === "connecting"}
                            >
                                Reconnect
                            </Button>
                        )}
                    </motion.div>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden">
                        <CardContent className="p-6">
                            <div className="grid gap-6">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <Label className="text-gray-700 text-lg font-medium">Design Requirements</Label>
                                        <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Required</Badge>
                                    </div>
                                    <Textarea
                                        placeholder="Describe the page you want to create in detail. For example: 'Create a modern landing page for a tech startup with a hero section, features grid, testimonials, and a contact form. Use blue and white as primary colors.'"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="h-36 bg-white border-gray-300 placeholder:text-gray-400 focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center mb-2">
                                        <Label className="text-gray-700 text-lg font-medium">Reference Images</Label>
                                        <Badge variant="outline" className="ml-2 text-gray-500 border-gray-300">Optional</Badge>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                            <Input
                                                type="file"
                                                id="image-upload"
                                                className="hidden"
                                                multiple
                                                accept=".jpg,.jpeg,.png"
                                                onChange={handleImageUpload}
                                            />
                                            <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                                <Upload className="h-8 w-8 text-blue-500" />
                                                <p className="text-gray-600 font-medium">Drag & drop images or click to browse</p>
                                                <p className="text-gray-500 text-sm">Upload reference designs or inspiration images (JPG, JPEG, PNG only)</p>
                                            </Label>
                                        </div>

                                        {isUploading && (
                                            <div className="mb-3">
                                                <div className="flex justify-between mb-1 text-xs text-gray-600">
                                                    <span>Uploading images...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {uploadedImages.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {uploadedImages.map(img => (
                                                    <div key={img.id} className="relative group rounded-md overflow-hidden border border-gray-200">
                                                        <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                                                        {img.isUploading && (
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                            <button
                                                                onClick={() => removeImage(img.id)}
                                                                className="text-white bg-red-600 rounded-full p-1"
                                                                type="button"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1 text-xs text-white truncate">
                                                            {img.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col items-center">
                                    <Button
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg py-6 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full justify-center max-w-md"
                                        onClick={handleSubmit}
                                        disabled={!prompt.trim() || isLoading || agentStatus !== "connected"}
                                        type="button"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader className="h-5 w-5 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                <span>Generate Page Design</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Loading Modal Overlay - Only shown when isLoading is true */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl border border-blue-100 w-full max-w-md mx-4"
                        >
                            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-xl">
                                <div className="flex items-center">
                                    <div className="relative mr-4">
                                        <motion.div
                                            animate={{
                                                rotate: 360,
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            className="text-blue-600"
                                        >
                                            <BrainCircuit className="h-8 w-8" />
                                        </motion.div>
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity
                                            }}
                                            className="absolute inset-0 bg-blue-400 bg-opacity-20 rounded-full blur-md"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-800">AI Page Generation</h3>
                                        <p className="text-blue-600 text-sm">Building your custom page design</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2 items-center">
                                        <h4 className="font-medium text-gray-700">Generation Progress</h4>
                                        <motion.div
                                            animate={{ opacity: [0.6, 1, 0.6] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                                                {getProgressPercentage()}% Complete
                                            </Badge>
                                        </motion.div>
                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                            initial={{ width: "10%" }}
                                            animate={{ width: `${getProgressPercentage()}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
                                    <div className="flex">
                                        <div className="mr-3 mt-0.5 relative">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Loader className="h-5 w-5 text-blue-600" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-blue-400 bg-opacity-30 rounded-full blur-sm"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-blue-800 font-medium">Current Status</p>
                                            <motion.p
                                                className="text-blue-700 mt-1"
                                                key={statusMessage} // Re-animate when status changes
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {statusMessage || 'Initializing page generation...'}
                                            </motion.p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Steps */}
                                <div className="space-y-3">
                                    <StageIndicator
                                        title="Analyzing Requirements"
                                        isCompleted={currentStage !== 'initializing'}
                                        isActive={currentStage === 'analyzing'}
                                    />

                                    <StageIndicator
                                        title="Designing Layout"
                                        isCompleted={currentStage === 'generating' || currentStage === 'finalizing'}
                                        isActive={currentStage === 'designing'}
                                    />

                                    <StageIndicator
                                        title="Generating Components"
                                        isCompleted={currentStage === 'finalizing'}
                                        isActive={currentStage === 'generating'}
                                    />

                                    <StageIndicator
                                        title="Finalizing Design"
                                        isCompleted={false}
                                        isActive={currentStage === 'finalizing'}
                                    />
                                </div>

                                <div className="mt-8 text-center text-sm text-gray-500">
                                    <p>This might take a minute or two.</p>
                                    <p>Our AI is crafting a custom page based on your requirements.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface StageIndicatorProps {
    title: string;
    isCompleted: boolean;
    isActive: boolean;
}

// Helper component for showing stage progress
const StageIndicator: React.FC<StageIndicatorProps> = ({ title, isCompleted, isActive }) => {
    return (
        <div className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${
                isCompleted ? 'bg-green-100' :
                    isActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
                {isCompleted ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                ) : isActive ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    </motion.div>
                ) : (
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                )}
            </div>
            <span className={`font-medium ${
                isCompleted ? 'text-green-700' :
                    isActive ? 'text-blue-700' : 'text-gray-400'
            }`}>
                {title}
            </span>
            {isActive && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-2 text-blue-600 text-xs"
                >
                    In progress...
                </motion.span>
            )}
        </div>
    );
};