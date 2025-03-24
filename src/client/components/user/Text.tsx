// components/user/Text.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNode } from "@craftjs/core";
import {Card,CardContent } from '@/components/ui/card';
import {Slider} from "@/components/ui/slider";
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

export interface TextProps {
    text?: string;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
    margin?: number;
}

// Define the type for setProp
type SetPropType = (cb: (props: TextProps) => void) => void;

// Custom type for the node parameter in useNode
interface NodeData {
    events: {
        selected: boolean;
    };
}

// Type definitions for our mapping objects
type FontWeightMapping = {
    [key in 'normal' | 'medium' | 'semibold' | 'bold']: string;
};

type TextAlignMapping = {
    [key in 'left' | 'center' | 'right']: string;
};

export const Text: React.FC<TextProps> = ({
                                              text = 'Click to edit text',
                                              fontSize = 16,
                                              textAlign = 'left',
                                              fontWeight = 'normal',
                                              color = '#000000',
                                              margin = 0
                                          }) => {
    const {
        connectors: { connect, drag },
        selected,
        actions: { setProp }
    } = useNode((node: NodeData) => ({
        selected: node.events.selected
    }));

    // Cast setProp to the correct type
    const typedSetProp = setProp as SetPropType;

    const [editable, setEditable] = useState<boolean>(false);

    // Create ref for more controlled ref handling
    const textRef = useRef<HTMLDivElement>(null);

    // Set ref handler function
    const setRef = (element: HTMLDivElement | null) => {
        if (element) {
            connect(drag(element));
        }
        if (textRef) {
            textRef.current = element;
        }
    };

    useEffect(() => {
        if (!selected) {
            setEditable(false);
        }
    }, [selected]);

    const fontWeightMapping: FontWeightMapping = {
        "normal": "font-normal",
        "medium": "font-medium",
        "semibold": "font-semibold",
        "bold": "font-bold"
    };

    const textAlignMapping: TextAlignMapping = {
        "left": "text-left",
        "center": "text-center",
        "right": "text-right"
    };

    return (
        <div
            ref={setRef}
            onClick={() => selected && setEditable(true)}
            style={{ position: 'relative', margin: `${margin}px` }}
        >
            <p
                contentEditable={editable}
                onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => {
                    typedSetProp((props: TextProps) => {
                        props.text = e.target.textContent || "";
                    });
                    setEditable(false);
                }}
                suppressContentEditableWarning={true}
                style={{
                    fontSize: `${fontSize}px`,
                    color,
                    margin: 0,
                    padding: '3px',
                    border: selected ? '1px dashed rgb(59, 130, 246)' : 'none',
                    borderRadius: '4px',
                    outline: 'none'
                }}
                className={cn(
                    fontWeightMapping[fontWeight] || 'font-normal',
                    textAlignMapping[textAlign] || 'text-left'
                )}
            >
                {text}
            </p>

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
                                    <Label>Text Content</Label>
                                    <Input
                                        value={text || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            typedSetProp((props: TextProps) => {
                                                props.text = e.target.value;
                                            })
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="style" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Font Size (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[fontSize || 16]}
                                            min={12}
                                            max={80}
                                            step={1}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: TextProps) => {
                                                    props.fontSize = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>12</span>
                                            <span>40</span>
                                            <span>80</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Alignment</Label>
                                    <Select
                                        value={textAlign}
                                        onValueChange={(value: 'left' | 'center' | 'right') =>
                                            typedSetProp((props: TextProps) => {
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
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Font Weight</Label>
                                    <Select
                                        value={fontWeight}
                                        onValueChange={(value: 'normal' | 'medium' | 'semibold' | 'bold') =>
                                            typedSetProp((props: TextProps) => {
                                                props.fontWeight = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select font weight" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="semibold">Semibold</SelectItem>
                                            <SelectItem value="bold">Bold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color || '#000000'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: TextProps) => {
                                                    props.color = e.target.value;
                                                })
                                            }
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={color || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: TextProps) => {
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
                                                typedSetProp((props: TextProps) => {
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
    props: TextProps;
    related?: {
        toolbar: boolean;
    };
    displayName?: string;
}

// Add displayName for better debugging in React DevTools
Text.displayName = 'Text';

// Add Craft.js configuration with proper typing
(Text as React.FC<TextProps> & { craft: CraftConfig }).craft = {
    props: {
        text: 'Click to edit text',
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'normal',
        color: '#000000',
        margin: 0
    },
    related: {
        toolbar: true
    },
    displayName: 'Text'
};