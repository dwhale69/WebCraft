// components/Toolbox.tsx
import React from "react";
import { Element, useEditor } from "@craftjs/core";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Icons
import {
    Type as TextIcon,
    Columns as SectionIcon,
    Square as ContainerIcon,
    Image as ImageIcon,
    SplitSquareHorizontalIcon as DividerIcon,
    LayoutGrid as FlexboxIcon,
    Heading as HeadingIcon,
    AlignLeft as ParagraphIcon,
    MousePointerClick as ButtonIcon
} from "lucide-react";

// Import from the index file instead of individual components
import {
    Container,
    Text,
    Section,
    Button as UserButton,
    Image,
    Divider,
    Flexbox,
    Heading,
    Paragraph
} from '@/client/components/user';

// Define component props for better type safety
interface ElementWithCanvas extends React.ReactElement {
    canvas?: boolean;
}

export const Toolbox: React.FC = () => {
    // Use more specific type for connectors
    const { connectors } = useEditor((state) => ({
        // You can add state selectors here if needed
    }));

    // Helper function to create components with proper typing
    const createDraggable = (
        ref: HTMLButtonElement | null,
        component: ElementWithCanvas
    ): void => {
        if (ref) {
            connectors.create(ref, component);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardContent className="p-0">
                <Tabs defaultValue="layout" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="layout">Layout</TabsTrigger>
                        <TabsTrigger value="components">Components</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[calc(100vh-220px)]">
                        {/* Layout Components */}
                        <TabsContent value="layout" className="p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-500">Layout Components</h3>
                                    <Badge variant="outline" className="ml-2 text-xs">Containers</Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* Container */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Container}
                                                            padding={20}
                                                            background="#ffffff"
                                                            canvas
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <ContainerIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                    <span>Container</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Basic container for content</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Flexbox */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Flexbox}
                                                            flexDirection="row"
                                                            padding={20}
                                                            canvas
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <FlexboxIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                                    <span>Flexbox</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-indigo-50 text-indigo-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Flexible layout container</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Section */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Section}
                                                            padding={20}
                                                            backgroundColor="#f8fafc"
                                                            canvas
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <SectionIcon className="h-4 w-4 mr-2 text-violet-500" />
                                                    <span>Section</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-violet-50 text-violet-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Content section with background</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Basic Components */}
                        <TabsContent value="components" className="p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-500">Text Elements</h3>
                                    <Badge variant="outline" className="ml-2 text-xs">Content</Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* Heading */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Heading}
                                                            text="New Heading"
                                                            fontSize={32}
                                                            color="#000000"
                                                            textAlign="left"
                                                            level={2}
                                                            margin={16}
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <HeadingIcon className="h-4 w-4 mr-2 text-slate-600" />
                                                    <span>Heading</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Section headings (H1-H6)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Paragraph */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Paragraph}
                                                            text="Start typing your paragraph here..."
                                                            fontSize={16}
                                                            color="#000000"
                                                            textAlign="left"
                                                            lineHeight={1.6}
                                                            margin={16}
                                                            maxWidth="75ch"
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <ParagraphIcon className="h-4 w-4 mr-2 text-gray-600" />
                                                    <span>Paragraph</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Paragraph text blocks</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Text */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Text}
                                                            text="New Text"
                                                            fontSize={16}
                                                            textAlign="left"
                                                            fontWeight="normal"
                                                            color="#000000"
                                                            margin={0}
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <TextIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                    <span>Text</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Simple text elements</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-500">UI Elements</h3>
                                    <Badge variant="outline" className="ml-2 text-xs">Interactive</Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* Button */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={UserButton}
                                                            text="Click Me"
                                                            variant="default"
                                                            intent="primary"
                                                            size="default"
                                                            margin={0}
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <ButtonIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                    <span>Button</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Interactive button element</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Image */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Image}
                                                            src="/api/placeholder/400/300"
                                                            alt="New Image"
                                                            width={320}
                                                            height={240}
                                                            borderRadius={0}
                                                            margin={0}
                                                            objectFit="cover"
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-2 text-emerald-500" />
                                                    <span>Image</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-emerald-50 text-emerald-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Image placement</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Divider */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    ref={(ref) => createDraggable(
                                                        ref,
                                                        <Element
                                                            is={Divider}
                                                            color="#e5e7eb"
                                                            thickness={1}
                                                            margin={10}
                                                        />
                                                    )}
                                                    variant="outline"
                                                    className="justify-start w-full cursor-grab group"
                                                    type="button"
                                                >
                                                    <DividerIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span>Divider</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-sm">Drag</div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Section divider line</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="p-3 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">Drag and drop components to build your layout</p>
                </div>
            </CardContent>
        </Card>
    );
};