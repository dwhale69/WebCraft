// components/user/Paragraph.tsx
import React, { useRef } from "react";
import { useNode } from "@craftjs/core";
import {Card,CardContent } from "@/components/ui/card";
import {Slider } from "@/components/ui/slider";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface ParagraphProps {
    text?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    margin?: number;
    maxWidth?: string | number;
}

// Define the type for setProp function
type SetPropType = (cb: (props: ParagraphProps) => void) => void;

export const Paragraph: React.FC<ParagraphProps> = ({
                                                        text,
                                                        fontSize,
                                                        color,
                                                        textAlign,
                                                        lineHeight,
                                                        margin,
                                                        maxWidth
                                                    }) => {
    const {
        connectors: { connect, drag },
        selected,
        actions: { setProp }
    } = useNode((node: any) => ({
        selected: node.events.selected
    }));

    // Ensure setProp has the correct type
    const typedSetProp = setProp as SetPropType;

    // Create ref for more controlled ref handling
    const elementRef = useRef<HTMLDivElement>(null);

    // Set ref handler function
    const setRef = (element: HTMLDivElement | null) => {
        if (element) {
            connect(drag(element));
        }
        if (elementRef) {
            elementRef.current = element;
        }
    };

    const textAlignMapping: Record<string, string> = {
        "left": "text-left",
        "center": "text-center",
        "right": "text-right",
        "justify": "text-justify"
    };

    const fontSizeMapping: Record<number, string> = {
        14: "text-sm",
        16: "text-base",
        18: "text-lg",
        20: "text-xl"
    };

    // Create a utility function to find the closest standard font size
    const getClosestFontSize = (size: number | undefined): number => {
        if (size === undefined) return 16; // Default font size

        const standardSizes = [14, 16, 18, 20];
        return standardSizes.reduce((prev, curr) =>
            Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
        );
    };

    const closestFontSize = getClosestFontSize(fontSize);

    return (
        <div ref={setRef}>
            {/* Paragraph Content */}
            <div
                style={{
                    margin: `${margin}px 0`,
                    color,
                    maxWidth: maxWidth === 'custom' ? `${maxWidth}px` : maxWidth,
                    lineHeight
                }}
                className={cn(
                    fontSizeMapping[closestFontSize] || 'text-base',
                    textAlignMapping[textAlign || 'left'] || 'text-left'
                )}
            >
                <p
                    contentEditable={selected}
                    onBlur={(e: React.FocusEvent<HTMLParagraphElement>) =>
                        typedSetProp((props: ParagraphProps) => {
                            props.text = e.target.innerText;
                        })
                    }
                    suppressContentEditableWarning={true}
                    className="m-0 p-0 outline-none focus:outline-dashed focus:outline-blue-400"
                >
                    {text}
                </p>
            </div>

            {/* Settings Panel */}
            {selected && (
                <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                        <Tabs defaultValue="style" className="w-full">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="style">Style</TabsTrigger>
                                <TabsTrigger value="text">Text</TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Paragraph Text</Label>
                                    <textarea
                                        value={text || ''}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            typedSetProp((props: ParagraphProps) => {
                                                props.text = e.target.value;
                                            })
                                        }
                                        className="w-full min-h-24 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="style" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Alignment</Label>
                                    <Select
                                        value={textAlign}
                                        onValueChange={(value: 'left' | 'center' | 'right' | 'justify') =>
                                            typedSetProp((props: ParagraphProps) => {
                                                props.textAlign = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select alignment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                            <SelectItem value="justify">Justify</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Max Width</Label>
                                    <Select
                                        value={String(maxWidth)}
                                        onValueChange={(value: string) =>
                                            typedSetProp((props: ParagraphProps) => {
                                                props.maxWidth = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select max width" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Full Width</SelectItem>
                                            <SelectItem value="75ch">Readable (75ch)</SelectItem>
                                            <SelectItem value="65ch">Narrow (65ch)</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Font Size (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[fontSize || 16]}
                                            min={12}
                                            max={24}
                                            step={1}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: ParagraphProps) => {
                                                    props.fontSize = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>12</span>
                                            <span>18</span>
                                            <span>24</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Line Height</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[typeof lineHeight === 'number' ? lineHeight : 1.6]}
                                            min={1}
                                            max={2}
                                            step={0.1}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: ParagraphProps) => {
                                                    props.lineHeight = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>1.0</span>
                                            <span>1.5</span>
                                            <span>2.0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color || '#000000'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: ParagraphProps) => {
                                                    props.color = e.target.value;
                                                })
                                            }
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={color || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: ParagraphProps) => {
                                                    props.color = e.target.value;
                                                })
                                            }
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Margin (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[margin || 0]}
                                            min={0}
                                            max={40}
                                            step={1}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: ParagraphProps) => {
                                                    props.margin = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// Define the type for craft configuration
interface CraftConfig {
    props: ParagraphProps;
    related: {
        toolbar: boolean;
    };
    displayName?: string;
}

// Add displayName for better debugging in React DevTools
Paragraph.displayName = 'Paragraph';

// Add Craft.js configuration with proper typing
(Paragraph as React.FC<ParagraphProps> & { craft: CraftConfig }).craft = {
    props: {
        text: "Start typing your paragraph here...",
        fontSize: 16,
        color: "#000000",
        textAlign: "left",
        lineHeight: 1.6,
        margin: 16,
        maxWidth: "75ch"
    },
    related: {
        toolbar: true
    },
    displayName: 'Paragraph'
};