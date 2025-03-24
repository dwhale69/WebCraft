// components/user/Heading.tsx
import React, {forwardRef, type JSX, useRef} from "react";
import { useNode } from "@craftjs/core";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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

// Define heading level type
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
// Define text alignment type
type TextAlign = 'left' | 'center' | 'right';
// Define font weight type
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface HeadingProps {
    text: string;
    fontSize?: number;
    color?: string;
    textAlign?: TextAlign;
    level?: HeadingLevel;
    margin?: number;
    fontWeight?: FontWeight;
}

// Use forwardRef pattern to properly handle ref
export const Heading = forwardRef<HTMLDivElement, HeadingProps>(({
                                                                     text = "Heading",
                                                                     fontSize = 32,
                                                                     color = "#000000",
                                                                     textAlign = "left",
                                                                     level = 2,
                                                                     margin = 16,
                                                                     fontWeight = "semibold"
                                                                 }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: HeadingProps) => void) => void;

    const {
        connectors: { connect, drag },
        selected,
        actions: { setProp }
    } = useNode((node: any) => ({
        selected: node.events.selected
    }));

    // Ensure setProp has the correct type
    const typedSetProp = setProp as SetPropType;

    // Create local refs for handling multiple ref assignments
    const containerRef = useRef<HTMLDivElement>(null);

    // Custom ref handler to merge forwardedRef, connect and drag
    const setCombinedRef = (element: HTMLDivElement | null) => {
        // Set local ref
        if (containerRef) {
            containerRef.current = element;
        }

        // Connect to Craft.js (connect and drag)
        if (element) {
            connect(drag(element));
        }

        // Handle forwardedRef
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
    };

    // Determine which heading tag to use based on level
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    // Define mapping objects and ensure they are type-safe
    const fontSizeMapping: Record<HeadingLevel, string> = {
        1: 'text-4xl',
        2: 'text-3xl',
        3: 'text-2xl',
        4: 'text-xl',
        5: 'text-lg',
        6: 'text-base'
    };

    const fontWeightMapping: Record<FontWeight, string> = {
        "normal": "font-normal",
        "medium": "font-medium",
        "semibold": "font-semibold",
        "bold": "font-bold"
    };

    const textAlignMapping: Record<TextAlign, string> = {
        "left": "text-left",
        "center": "text-center",
        "right": "text-right"
    };

    return (
        <div ref={setCombinedRef}>
            {/* Heading Content */}
            <div
                style={{
                    margin: `${margin}px 0`,
                    color: color || 'inherit'
                }}
                className={cn(
                    fontSizeMapping[level] || 'text-2xl',
                    fontWeightMapping[fontWeight] || 'font-semibold',
                    textAlignMapping[textAlign] || 'text-left'
                )}
            >
                <HeadingTag
                    contentEditable={selected}
                    suppressContentEditableWarning={true}
                    className="m-0 p-0 outline-none focus:outline-dashed focus:outline-blue-400"
                >
                    {text}
                </HeadingTag>
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
                                    <Label>Heading Text</Label>
                                    <Input
                                        value={text}
                                        onChange={e => typedSetProp((props: HeadingProps) => {props.text = e.target.value;})}
                                        className="w-full"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="style" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Heading Level</Label>
                                    <Select
                                        value={level.toString()}
                                        onValueChange={(value) => {
                                            // Parse string to number and ensure type safety
                                            const levelValue = parseInt(value, 10) as HeadingLevel;
                                            if (levelValue >= 1 && levelValue <= 6) {
                                                typedSetProp((props: HeadingProps) => {props.level = levelValue;});
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">H1</SelectItem>
                                            <SelectItem value="2">H2</SelectItem>
                                            <SelectItem value="3">H3</SelectItem>
                                            <SelectItem value="4">H4</SelectItem>
                                            <SelectItem value="5">H5</SelectItem>
                                            <SelectItem value="6">H6</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Alignment</Label>
                                    <Select
                                        value={textAlign}
                                        onValueChange={(value: TextAlign) =>
                                            typedSetProp((props: HeadingProps) => {props.textAlign = value;})}
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
                                        onValueChange={(value: FontWeight) =>
                                            typedSetProp((props: HeadingProps) => {props.fontWeight = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select weight" />
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
                                            value={color || "#000000"}
                                            onChange={e => typedSetProp((props: HeadingProps) => {props.color = e.target.value;})}
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={color || ""}
                                            onChange={e => typedSetProp((props: HeadingProps) => {props.color = e.target.value;})}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Margin</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[margin]}
                                            min={0}
                                            max={40}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: HeadingProps) => {props.margin = value;})}
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
});

// Add displayName for better debugging in React DevTools
Heading.displayName = 'Heading';

// Default props and Craft.js configuration
(Heading as any).craft = {
    props: {
        text: "Heading",
        fontSize: 32,
        color: "#000000",
        textAlign: "left",
        level: 2,
        margin: 16,
        fontWeight: "semibold"
    },
    related: {
        toolbar: true
    }
};