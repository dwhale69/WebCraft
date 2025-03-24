// components/user/Section.tsx
import React, { useRef } from "react";
import { useNode } from "@craftjs/core";
import {
    Card, CardContent} from "@/components/ui/card";
import {Slider} from "@/components/ui/slider";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
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

export interface SectionProps {
    backgroundColor?: string;
    padding?: number;
    margin?: number;
    width?: string | number;
    height?: string | number;
    minHeight?: number;
    borderRadius?: number;
    shadow?: 'none' | 'small' | 'medium' | 'large' | 'custom';
    alignment?: string;
    children?: React.ReactNode;
}

// Define the type for setProp
type SetPropType = (cb: (props: SectionProps) => void) => void;


// Shadow mapping type
type ShadowMapping = {
    [key in 'none' | 'small' | 'medium' | 'large' | 'custom']: string;
};

export const Section: React.FC<SectionProps> = ({
                                                    backgroundColor = "#ffffff",
                                                    padding = 20,
                                                    margin = 0,
                                                    width = "100%",
                                                    height = "auto",
                                                    minHeight = 100,
                                                    borderRadius = 0,
                                                    shadow = "none",
                                                    alignment = "flex-start",
                                                    children,
                                                }) => {
    const {
        connectors: { connect, drag },
        selected,
        actions: { setProp }
    } = useNode((node: any) => ({
        selected: node.events.selected,
    }));

    // Cast setProp to the correct type
    const typedSetProp = setProp as SetPropType;

    // Create ref for more controlled ref handling
    const sectionRef = useRef<HTMLDivElement>(null);

    // Set ref handler function
    const setRef = (element: HTMLDivElement | null) => {
        if (element) {
            connect(drag(element));
        }
        if (sectionRef) {
            sectionRef.current = element;
        }
    };

    // Shadow mapping to Tailwind classes
    const shadowMapping: ShadowMapping = {
        'none': 'shadow-none',
        'small': 'shadow-sm',
        'medium': 'shadow',
        'large': 'shadow-md',
        'custom': 'shadow-lg'
    };

    return (
        <div
            ref={setRef}
            style={{ margin: `${margin}px` }}
        >
            <div
                style={{
                    backgroundColor,
                    padding: `${padding}px`,
                    width: width === 'custom' && typeof width === 'number' ? `${width}px` : width,
                    height: height === 'auto' ? 'auto' : typeof height === 'number' ? `${height}px` : height,
                    minHeight: `${minHeight}px`,
                    borderRadius: `${borderRadius}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: alignment,
                    position: 'relative',
                }}
                className={cn(shadowMapping[shadow as keyof ShadowMapping] || 'shadow-none')}
            >
                {children}
                {!children && (
                    <div className="w-full h-full min-h-20 flex items-center justify-center text-gray-400 text-sm">
                        Drop components here
                    </div>
                )}
            </div>

            {selected && (
                <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                        <Tabs defaultValue="style" className="w-full">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="style">Style</TabsTrigger>
                                <TabsTrigger value="layout">Layout</TabsTrigger>
                            </TabsList>

                            <TabsContent value="style" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={backgroundColor || '#ffffff'}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.backgroundColor = e.target.value;
                                                })
                                            }
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={backgroundColor || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.backgroundColor = e.target.value;
                                                })
                                            }
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderRadius || 0]}
                                            min={0}
                                            max={50}
                                            step={1}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.borderRadius = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>25</span>
                                            <span>50</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Shadow</Label>
                                    <Select
                                        value={shadow}
                                        onValueChange={(value: 'none' | 'small' | 'medium' | 'large' | 'custom') =>
                                            typedSetProp((props: SectionProps) => {
                                                props.shadow = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select shadow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="layout" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Padding (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[padding || 0]}
                                            min={0}
                                            max={100}
                                            step={4}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.padding = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>50</span>
                                            <span>100</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Margin (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[margin || 0]}
                                            min={0}
                                            max={100}
                                            step={4}
                                            onValueChange={([value]: number[]) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.margin = value;
                                                })
                                            }
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>50</span>
                                            <span>100</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Width</Label>
                                    <Select
                                        value={String(width)}
                                        onValueChange={(value: string) =>
                                            typedSetProp((props: SectionProps) => {
                                                props.width = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select width" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100%">Full Width</SelectItem>
                                            <SelectItem value="75%">75%</SelectItem>
                                            <SelectItem value="50%">50%</SelectItem>
                                            <SelectItem value="25%">25%</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Height</Label>
                                    <Select
                                        value={String(height)}
                                        onValueChange={(value: string) =>
                                            typedSetProp((props: SectionProps) => {
                                                props.height = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select height" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {height === 'custom' && (
                                    <div className="space-y-2">
                                        <Label>Custom Height (px)</Label>
                                        <Input
                                            type="number"
                                            value={height === 'custom' && typeof height === 'number' ? height : 0}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                typedSetProp((props: SectionProps) => {
                                                    props.height = parseInt(e.target.value);
                                                })
                                            }
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Min Height (px)</Label>
                                    <Input
                                        type="number"
                                        value={minHeight || 0}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            typedSetProp((props: SectionProps) => {
                                                props.minHeight = parseInt(e.target.value);
                                            })
                                        }
                                        min={0}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Content Alignment</Label>
                                    <Select
                                        value={alignment}
                                        onValueChange={(value: string) =>
                                            typedSetProp((props: SectionProps) => {
                                                props.alignment = value;
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select alignment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flex-start">Start</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="flex-end">End</SelectItem>
                                            <SelectItem value="stretch">Stretch</SelectItem>
                                        </SelectContent>
                                    </Select>
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
    props: SectionProps;
    related?: {
        toolbar?: boolean;
    };
    displayName?: string;
}

// Add displayName for better debugging in React DevTools
Section.displayName = 'Section';

// Add Craft.js configuration with proper typing
(Section as React.FC<SectionProps> & { craft: CraftConfig }).craft = {
    props: {
        backgroundColor: "#ffffff",
        padding: 20,
        margin: 0,
        width: "100%",
        height: "auto",
        minHeight: 100,
        borderRadius: 0,
        shadow: "none",
        alignment: "flex-start"
    },
    displayName: 'Section'
};