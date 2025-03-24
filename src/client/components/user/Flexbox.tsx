// components/user/Flexbox.tsx
import React, { forwardRef, useRef } from "react";
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

// Union type for width values
type WidthValue = '100%' | '75%' | '50%' | '25%' | 'custom' | number;

export interface FlexboxProps {
    // Flex container properties
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: number;

    // Layout properties
    padding?: number;
    margin?: number;
    width?: WidthValue; // Using the union type
    minHeight?: number;
    backgroundColor?: string;
    borderRadius?: number;

    // Child elements
    children?: React.ReactNode;
}

// Use forwardRef pattern to properly handle ref
export const Flexbox = forwardRef<HTMLDivElement, FlexboxProps>(({
                                                                     // Flex container properties with defaults
                                                                     flexDirection = 'row',
                                                                     justifyContent = 'flex-start',
                                                                     alignItems = 'stretch',
                                                                     flexWrap = 'nowrap',
                                                                     gap = 8,

                                                                     // Layout properties with defaults
                                                                     padding = 16,
                                                                     margin = 0,
                                                                     width = '100%',
                                                                     minHeight = 100,
                                                                     backgroundColor = '#f5f5f5',
                                                                     borderRadius = 0,

                                                                     // Child elements
                                                                     children
                                                                 }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: FlexboxProps) => void) => void;

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
    const innerRef = useRef<HTMLDivElement>(null);

    // Custom ref handler to merge forwardedRef and connect ref
    const setContainerRef = (element: HTMLDivElement | null) => {
        // Set local ref
        if (containerRef) {
            containerRef.current = element;
        }

        // Handle forwardedRef
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
    };

    // Custom ref handler for connect and drag
    const setInnerRef = (element: HTMLDivElement | null) => {
        // Set local ref
        if (innerRef) {
            innerRef.current = element;
        }

        // Connect to Craft.js
        if (element) {
            connect(drag(element));
        }
    };

    // Process width value, ensuring type safety
    const getWidthValue = (widthValue: WidthValue): string => {
        if (widthValue === 'custom') {
            // If it's 'custom', need to return a pixel value
            return typeof width === 'number' ? `${width}px` : '100%';
        }
        return typeof widthValue === 'number' ? `${widthValue}px` : widthValue;
    };

    return (
        <div ref={setContainerRef}>
            <div
                ref={setInnerRef}
                style={{
                    // Flex properties
                    display: 'flex',
                    flexDirection,
                    justifyContent,
                    alignItems,
                    flexWrap,
                    gap: `${gap}px`,

                    // Layout properties
                    padding: `${padding}px`,
                    margin: `${margin}px`,
                    width: getWidthValue(width),
                    minHeight: `${minHeight}px`,
                    backgroundColor,
                    borderRadius: `${borderRadius}px`,

                    // Visual feedback
                    border: selected ? '1px dashed rgb(59, 130, 246)' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                }}
                className="group"
            >
                {children}
                {!children && (
                    <div className="w-full h-full min-h-16 flex items-center justify-center text-gray-400 text-sm">
                        Drop components here
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            {selected && (
                <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                        <Tabs defaultValue="flex" className="w-full">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="flex">Flex</TabsTrigger>
                                <TabsTrigger value="layout">Layout</TabsTrigger>
                            </TabsList>

                            <TabsContent value="flex" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Direction</Label>
                                    <Select
                                        value={flexDirection}
                                        onValueChange={(value: 'row' | 'column' | 'row-reverse' | 'column-reverse') =>
                                            typedSetProp((props: FlexboxProps) => {props.flexDirection = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select direction" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="row">Row</SelectItem>
                                            <SelectItem value="column">Column</SelectItem>
                                            <SelectItem value="row-reverse">Row Reverse</SelectItem>
                                            <SelectItem value="column-reverse">Column Reverse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Wrap</Label>
                                    <Select
                                        value={flexWrap}
                                        onValueChange={(value: 'nowrap' | 'wrap' | 'wrap-reverse') =>
                                            typedSetProp((props: FlexboxProps) => {props.flexWrap = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select wrap" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nowrap">No Wrap</SelectItem>
                                            <SelectItem value="wrap">Wrap</SelectItem>
                                            <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Justify Content</Label>
                                    <Select
                                        value={justifyContent}
                                        onValueChange={(value: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly') =>
                                            typedSetProp((props: FlexboxProps) => {props.justifyContent = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select justify content" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flex-start">Start</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="flex-end">End</SelectItem>
                                            <SelectItem value="space-between">Space Between</SelectItem>
                                            <SelectItem value="space-around">Space Around</SelectItem>
                                            <SelectItem value="space-evenly">Space Evenly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Align Items</Label>
                                    <Select
                                        value={alignItems}
                                        onValueChange={(value: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline') =>
                                            typedSetProp((props: FlexboxProps) => {props.alignItems = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select align items" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flex-start">Start</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="flex-end">End</SelectItem>
                                            <SelectItem value="stretch">Stretch</SelectItem>
                                            <SelectItem value="baseline">Baseline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Gap (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[gap]}
                                            min={0}
                                            max={40}
                                            step={4}
                                            onValueChange={([value]) => typedSetProp((props: FlexboxProps) => {props.gap = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="layout" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Padding (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[padding]}
                                            min={0}
                                            max={40}
                                            step={4}
                                            onValueChange={([value]) => typedSetProp((props: FlexboxProps) => {props.padding = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Margin (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[margin]}
                                            min={0}
                                            max={40}
                                            step={4}
                                            onValueChange={([value]) => typedSetProp((props: FlexboxProps) => {props.margin = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Width</Label>
                                    <Select
                                        value={typeof width === 'string' ? width : 'custom'}
                                        onValueChange={(value: '100%' | '75%' | '50%' | '25%' | 'custom') =>
                                            typedSetProp((props: FlexboxProps) => {props.width = value;})}
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
                                    <Label>Min Height (px)</Label>
                                    <Input
                                        type="number"
                                        value={minHeight}
                                        onChange={e => {
                                            const value = parseInt(e.target.value, 10);
                                            if (!isNaN(value)) {
                                                typedSetProp((props: FlexboxProps) => {props.minHeight = value;});
                                            }
                                        }}
                                        min={0}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderRadius]}
                                            min={0}
                                            max={20}
                                            step={2}
                                            onValueChange={([value]) => typedSetProp((props: FlexboxProps) => {props.borderRadius = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>10</span>
                                            <span>20</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={backgroundColor || '#f5f5f5'}
                                            onChange={e => typedSetProp((props: FlexboxProps) => {props.backgroundColor = e.target.value;})}
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={backgroundColor || ''}
                                            onChange={e => typedSetProp((props: FlexboxProps) => {props.backgroundColor = e.target.value;})}
                                            className="w-full"
                                            placeholder="e.g. #f0f0f0 or transparent"
                                        />
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
Flexbox.displayName = 'Flexbox';

// Component default props and rules
(Flexbox as any).craft = {
    props: {
        // Default flex properties
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: 8,

        // Default layout properties
        padding: 16,
        margin: 0,
        width: '100%',
        minHeight: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 0
    },
    // Add rules to ensure it can accept dragged child components
    rules: {
        canDrop: () => true
    }
};