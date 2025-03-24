// src/pages/index.tsx
import React, {useEffect, useState} from 'react';
import {Editor, Element, Frame, useEditor} from "@craftjs/core";
import {TooltipProvider} from "@/components/ui/tooltip";
import {toast, Toaster as SonnerToaster} from "sonner";

// Shadcn UI Components
import {Card, CardContent,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";

// Icons
import {ArrowLeft, Eye, EyeOff, Fullscreen, Grid3X3, PanelLeft, PanelRightClose, Save} from "lucide-react";

// User Components
import {
    Button as UserButton,
    Container,
    Divider,
    Flexbox,
    Heading,
    Image,
    Paragraph,
    Section,
    Text
} from '@/client/components/user';
import {Toolbox} from '@/client/components/Toolbox';
import {SettingsPanel} from '@/client/components/SettingsPanel';
import {FullscreenPreview} from '@/client/components/FullscreenPreview';

// AI Page Builder Components - these would be created in separate files
import {AIPageBuilder} from '@/client/components/AIPageBuilder';

// Define types for component resolver
type ComponentsMap = {
    Container: typeof Container;
    Text: typeof Text;
    UserButton: typeof UserButton;
    Image: typeof Image;
    Divider: typeof Divider;
    Section: typeof Section;
    Flexbox: typeof Flexbox;
    Heading: typeof Heading;
    Paragraph: typeof Paragraph;
};

// Shared resolver configuration to ensure component consistency
const componentResolver: ComponentsMap = {
    Container,
    Text,
    UserButton,
    Image,
    Divider,
    Section,
    Flexbox,
    Heading,
    Paragraph
};

interface RenderNodeProps {
    render: React.ReactNode;
}

const RenderNode: React.FC<RenderNodeProps> = ({ render }) => {
    return (
        <div className="relative">
            {render}
        </div>
    );
};

export default function App() {
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [jsonContent, setJsonContent] = useState<string>('');
    const [jsonUploadMethod, setJsonUploadMethod] = useState<'paste' | 'file'>('paste');
    const [panelVisible, setPanelVisible] = useState<boolean>(true);

    // AI Page Builder States
    const [showAiBuilder, setShowAiBuilder] = useState<boolean>(true);
    const [generatedJson, setGeneratedJson] = useState<Record<string, any> | null>(null);

    // Handle AI generation submission
    const handleAiSubmission = (jsonData: Record<string, any>): void => {
        setGeneratedJson(jsonData);
        setShowAiBuilder(false);
    };

    // Handle returning to AI builder
    const handleReturnToAiBuilder = (): void => {
        setShowAiBuilder(true);
        setGeneratedJson(null);
    };

    // Handle save changes
    const handleSaveChanges = (jsonData: Record<string, any>): void => {
        setGeneratedJson(jsonData);
        toast.success("Changes saved successfully", {
            description: "Your design has been updated."
        });
    };

    return (
        <>
            <TooltipProvider>
                <div className="bg-gray-50 min-h-screen">
                    {showAiBuilder ? (
                        <>
                            <AIPageBuilder onSubmit={handleAiSubmission} />
                        </>
                    ) : (
                        <Editor
                            resolver={componentResolver}
                            onRender={RenderNode}
                            enabled={!previewMode}
                        >
                            <EditorContent
                                previewMode={previewMode}
                                setPreviewMode={setPreviewMode}
                                fullscreenMode={fullscreenMode}
                                setFullscreenMode={setFullscreenMode}
                                showGrid={showGrid}
                                setShowGrid={setShowGrid}
                                dialogOpen={dialogOpen}
                                setDialogOpen={setDialogOpen}
                                jsonContent={jsonContent}
                                setJsonContent={setJsonContent}
                                jsonUploadMethod={jsonUploadMethod}
                                setJsonUploadMethod={setJsonUploadMethod}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                panelVisible={panelVisible}
                                setPanelVisible={setPanelVisible}
                                generatedJson={generatedJson}
                                onReturnToAiBuilder={handleReturnToAiBuilder}
                                onSaveChanges={handleSaveChanges}
                            />

                            {/* Fullscreen Preview Component */}
                            <FullscreenPreview
                                fullscreenMode={fullscreenMode}
                                setFullscreenMode={setFullscreenMode}
                            />
                        </Editor>
                    )}
                    <SonnerToaster position="bottom-center" expand={false} richColors />
                </div>
            </TooltipProvider>
        </>
    );
}

interface EditorContentProps {
    previewMode: boolean;
    setPreviewMode: (value: boolean) => void;
    fullscreenMode: boolean;
    setFullscreenMode: (value: boolean) => void;
    showGrid: boolean;
    setShowGrid: (value: boolean) => void;
    dialogOpen: boolean;
    setDialogOpen: (value: boolean) => void;
    jsonContent: string;
    setJsonContent: (value: string) => void;
    jsonUploadMethod: 'paste' | 'file';
    setJsonUploadMethod: (value: 'paste' | 'file') => void;
    activeTab: number;
    setActiveTab: (value: number) => void;
    panelVisible: boolean;
    setPanelVisible: (value: boolean) => void;
    generatedJson: Record<string, any> | null;
    onReturnToAiBuilder: () => void;
    onSaveChanges: (jsonData: Record<string, any>) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
                                                         previewMode,
                                                         setPreviewMode,
                                                         fullscreenMode,
                                                         setFullscreenMode,
                                                         showGrid,
                                                         setShowGrid,
                                                         dialogOpen,
                                                         setDialogOpen,
                                                         jsonContent,
                                                         setJsonContent,
                                                         jsonUploadMethod,
                                                         setJsonUploadMethod,
                                                         activeTab,
                                                         setActiveTab,
                                                         panelVisible,
                                                         setPanelVisible,
                                                         generatedJson,
                                                         onReturnToAiBuilder,
                                                         onSaveChanges
                                                     }) => {
    const { actions, query, enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    // Get canUndo and canRedo from hooks after state is available
    const canUndo = enabled && query.history.canUndo();
    const canRedo = enabled && query.history.canRedo();

    // Track whether side panel was visible before fullscreen mode
    const [panelVisibleBeforeFullscreen, setPanelVisibleBeforeFullscreen] = useState<boolean>(true);

    // Load generated JSON when available
    useEffect(() => {
        if (generatedJson && actions) {
            try {
                const jsonString = JSON.stringify(generatedJson);
                actions.deserialize(jsonString);
            } catch (error) {
                console.error("Error loading generated JSON:", error);
                toast.error("Error Loading Design", {
                    description: "There was a problem loading the AI-generated design."
                });
            }
        }
    }, [generatedJson, actions]);

    // Handle saving changes to the design
    const handleSave = (): void => {
        if (!query || !actions) return;

        try {
            // Get the current state as JSON
            const serializedJSON = query.serialize();

            // Save the serialized JSON to parent component
            onSaveChanges(JSON.parse(serializedJSON));
        } catch (error) {
            console.error("Error saving changes:", error);
            toast.error("Error Saving Changes", {
                description: "There was a problem saving your design changes."
            });
        }
    };

    const handleTabChange = (value: number): void => {
        setActiveTab(value);
    };

    const toggleFullscreenPreview = (): void => {
        if (previewMode) {
            setPreviewMode(false);
            setTimeout(() => {
                // Store panel visibility state before hiding
                setPanelVisibleBeforeFullscreen(panelVisible);
                // Hide panel when entering fullscreen
                if (panelVisible) setPanelVisible(false);
                setFullscreenMode(true);
            }, 300);
        } else {
            // Show loading indicator or toast
            toast.info("Preparing fullscreen view...");

            // Store panel visibility state before hiding
            setPanelVisibleBeforeFullscreen(panelVisible);
            // Hide panel when entering fullscreen
            if (panelVisible) setPanelVisible(false);

            // Small delay to let toast appear and allow editor to stabilize
            setTimeout(() => {
                // Get reference to editor content for potential pre-rendering work
                const canvasContainer = document.querySelector('.min-h-\\[600px\\] .p-0.h-full') ||
                    document.querySelector('.rounded-xl.border.bg-card.min-h-\\[600px\\]');

                if (canvasContainer) {
                    // Temporarily hide any editor UI elements
                    const indicators = document.querySelectorAll('.craft-block-indicator, .craft-hover-indicator, .craft-selected-indicator');
                    indicators.forEach(el => {
                        if ((el as HTMLElement).style) (el as HTMLElement).style.display = 'none';
                    });

                    // Hide the grid overlay temporarily for cleaner capture
                    const gridOverlay = document.querySelector('.absolute.inset-0.pointer-events-none.z-10');
                    if (gridOverlay && (gridOverlay as HTMLElement).style) {
                        (gridOverlay as HTMLElement).style.display = 'none';
                    }

                    // Actually toggle fullscreen mode after preparations
                    setFullscreenMode(true);

                    // Restore visibility after a delay (fullscreen component will have captured by then)
                    setTimeout(() => {
                        indicators.forEach(el => {
                            if ((el as HTMLElement).style) (el as HTMLElement).style.display = '';
                        });
                        if (gridOverlay && (gridOverlay as HTMLElement).style) {
                            (gridOverlay as HTMLElement).style.display = '';
                        }
                    }, 600);
                } else {
                    // If we can't find the expected containers, just toggle fullscreen
                    setFullscreenMode(true);
                }
            }, 100);
        }
    };

    // Handle exiting fullscreen mode
    useEffect(() => {
        if (!fullscreenMode && panelVisibleBeforeFullscreen) {
            // Restore panel visibility when exiting fullscreen
            setTimeout(() => {
                setPanelVisible(panelVisibleBeforeFullscreen);
            }, 300);
        }
    }, [fullscreenMode, panelVisibleBeforeFullscreen]);

    return (
        <>
            <div className={`flex flex-col h-screen ${fullscreenMode ? 'hidden' : ''}`}>
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReturnToAiBuilder}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span>Back to AI Builder</span>
                        </Button>

                        <Separator orientation="vertical" className="h-6" />

                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-800">AI-Generated Design</h1>
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">AI Created</Badge>
                            <Badge variant="outline" className="ml-2">Shadcn UI</Badge>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Canvas Area */}
                    <div
                        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
                            panelVisible ? "mr-80" : "mr-0"
                        }`}
                    >
                        <div className="container mx-auto p-6 max-w-6xl">
                            {/* Unified Toolbar */}
                            <Card className="mb-6 shadow-sm">
                                <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                        {/* Left section */}
                                        <div className="flex items-center space-x-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowGrid(!showGrid)}
                                                            className="text-gray-600"
                                                        >
                                                            <Grid3X3 className="h-4 w-4 mr-1" />
                                                            {showGrid ? 'Hide Grid' : 'Show Grid'}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{showGrid ? 'Hide layout grid' : 'Show layout grid'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        {/* Right section - All controls grouped together */}
                                        <div className="flex items-center space-x-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={toggleFullscreenPreview}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                                        >
                                                            <Fullscreen className="h-4 w-4 mr-1" />
                                                            Fullscreen
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View in fullscreen mode</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPanelVisible(!panelVisible)}
                                                            className="text-gray-600"
                                                        >
                                                            {panelVisible ?
                                                                <><PanelRightClose className="h-4 w-4 mr-1" />Hide Panel</> :
                                                                <><PanelLeft className="h-4 w-4 mr-1" />Show Panel</>
                                                            }
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{panelVisible ? 'Hide side panel' : 'Show side panel'}</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Separator orientation="vertical" className="h-6 mx-1" />

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={handleSave}
                                                            className="bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <Save className="h-4 w-4 mr-1" />
                                                            Save
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Save current changes</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={previewMode ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setPreviewMode(!previewMode)}
                                                            className={previewMode ?
                                                                "bg-purple-600 text-white hover:bg-purple-700" :
                                                                "text-purple-600 border-purple-200 hover:bg-purple-50"
                                                            }
                                                        >
                                                            {previewMode ? (
                                                                <>
                                                                    <EyeOff className="h-4 w-4 mr-1" />
                                                                    Exit Preview
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Preview
                                                                </>
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{previewMode ? 'Exit preview mode' : 'Enter preview mode'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Canvas */}
                            <Card className="min-h-[600px] relative shadow-sm">
                                <CardContent className="p-0 h-full">
                                    <Frame>
                                        <Element
                                            is={Container}
                                            padding={20}
                                            background="#ffffff"
                                            canvas
                                            data-cy="root-container"
                                        />
                                    </Frame>

                                    {/* Grid Overlay */}
                                    {showGrid && (
                                        <div
                                            className="absolute inset-0 pointer-events-none z-10"
                                            style={{
                                                background: `
                                                    repeating-linear-gradient(
                                                        0deg,
                                                        transparent,
                                                        transparent 19px,
                                                        rgba(0, 0, 0, 0.03) 20px
                                                    ),
                                                    repeating-linear-gradient(
                                                        90deg,
                                                        transparent,
                                                        transparent 19px,
                                                        rgba(0, 0, 0, 0.03) 20px
                                                    )
                                                `,
                                                borderRadius: '0.375rem'
                                            }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div
                        className={`fixed right-0 top-[61px] bottom-0 w-80 bg-white border-l border-gray-200 transition-transform duration-300 ${
                            panelVisible ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <Tabs defaultValue="components" onValueChange={(value) => handleTabChange(Number(value))}>
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="components">Components</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <div className="h-[calc(100vh-124px)] overflow-auto">
                                <TabsContent value="components" className="m-0">
                                    <Toolbox />
                                </TabsContent>

                                <TabsContent value="settings" className="m-0 p-4">
                                    <SettingsPanel />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
};