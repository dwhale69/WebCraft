// components/user/Container.tsx
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

export interface ContainerProps {
    background?: string;
    padding?: number;
    margin?: number;
    borderRadius?: number;
    elevation?: 0 | 1 | 2 | 3 | 4 | 5; // Explicitly limited to specific values
    display?: 'block' | 'flex' | 'grid'; // Explicitly limited to specific values
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    children?: React.ReactNode;
}

// Use forwardRef pattern to properly handle ref
export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
                                                                         background = '#ffffff',
                                                                         padding = 20,
                                                                         margin = 0,
                                                                         borderRadius = 4,
                                                                         elevation = 0,
                                                                         display = 'block',
                                                                         justifyContent = 'flex-start',
                                                                         alignItems = 'flex-start',
                                                                         children
                                                                     }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: ContainerProps) => void) => void;

    const {
        connectors: { connect, drag },
        selected,
        dragging,
        actions: { setProp }
    } = useNode((node: any) => ({
        selected: node.events.selected,
        dragging: node.events.dragged
    }));

    // Ensure setProp has the correct type
    const typedSetProp = setProp as SetPropType;

    // Create local refs for handling multiple ref assignments
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    // Custom ref handler to merge forwardedRef and connect ref
    const setContainerRef = (element: HTMLDivElement | null) => {
        // Set local ref
        if (containerRef) {
            containerRef.current = element;
        }

        // Connect to Craft.js
        if (element) {
            connect(element);
        }

        // Handle forwardedRef
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
    };

    // Custom ref handler for drag operations
    const setDragRef = (element: HTMLDivElement | null) => {
        // Set local drag ref
        if (dragRef) {
            dragRef.current = element;
        }

        // Connect to Craft.js drag system
        if (element) {
            drag(element);
        }
    };

    // Shadow mapping
    const shadowMapping: Record<number, string> = {
        0: 'shadow-none',
        1: 'shadow-sm',
        2: 'shadow',
        3: 'shadow-md',
        4: 'shadow-lg',
        5: 'shadow-xl'
    };

    return (
        <div
            ref={setContainerRef}
            style={{
                margin: `${margin}px`,
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}
            data-cy="container"
        >
            <div
                ref={setDragRef}
                style={{
                    cursor: 'move',
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    style={{
                        background,
                        padding: `${padding}px`,
                        borderRadius: `${borderRadius}px`,
                        display,
                        justifyContent,
                        alignItems,
                        minHeight: '30px',
                        border: selected ? '2px solid rgb(59, 130, 246)' : '2px solid transparent',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        overflowX: 'hidden'
                    }}
                    className={cn(shadowMapping[elevation] || 'shadow-none')}
                >
                    {children}
                    {!children && (
                        <div className="w-full h-full min-h-12 flex items-center justify-center text-gray-400 text-sm">
                            Drop components here
                        </div>
                    )}
                </div>
            </div>

            {/* Settings panel */}
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
                                    <Label>Background</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={background}
                                            onChange={e => typedSetProp((props: ContainerProps) => {props.background = e.target.value;})}
                                            className="w-8 h-8 border-0"
                                        />
                                        <Input
                                            value={background}
                                            onChange={e => typedSetProp((props: ContainerProps) => {props.background = e.target.value;})}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderRadius]}
                                            min={0}
                                            max={24}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ContainerProps) => {props.borderRadius = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>12</span>
                                            <span>24</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Elevation</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[elevation]}
                                            min={0}
                                            max={5}
                                            step={1}
                                            onValueChange={([value]) => {
                                                // Ensure value is a valid shadow level (0-5)
                                                const shadowLevel = Math.min(5, Math.max(0, value)) as 0 | 1 | 2 | 3 | 4 | 5;
                                                typedSetProp((props: ContainerProps) => {props.elevation = shadowLevel;});
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>None</span>
                                            <span>Medium</span>
                                            <span>High</span>
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
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ContainerProps) => {props.padding = value;})}
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
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ContainerProps) => {props.margin = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Display</Label>
                                    <Select
                                        value={display}
                                        onValueChange={(value: 'block' | 'flex' | 'grid') => typedSetProp((props: ContainerProps) => {props.display = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select display type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="block">Block</SelectItem>
                                            <SelectItem value="flex">Flex</SelectItem>
                                            <SelectItem value="grid">Grid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {display === 'flex' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Justify Content</Label>
                                            <Select
                                                value={justifyContent}
                                                onValueChange={(value: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around') =>
                                                    typedSetProp((props: ContainerProps) => {props.justifyContent = value;})}
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
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Align Items</Label>
                                            <Select
                                                value={alignItems}
                                                onValueChange={(value: 'flex-start' | 'center' | 'flex-end' | 'stretch') =>
                                                    typedSetProp((props: ContainerProps) => {props.alignItems = value;})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select align items" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="flex-start">Start</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="flex-end">End</SelectItem>
                                                    <SelectItem value="stretch">Stretch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

// Add displayName for better debugging in React DevTools
Container.displayName = 'Container';

// Add Craft.js configuration
(Container as any).craft = {
    props: {
        background: '#ffffff',
        padding: 20,
        margin: 0,
        borderRadius: 4,
        elevation: 0,
        display: "block",
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    rules: {
        canDrop: () => true
    }
};