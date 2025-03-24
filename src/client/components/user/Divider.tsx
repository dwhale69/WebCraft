// components/user/Divider.tsx
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

export interface DividerProps {
    width?: number;
    color?: string;
    thickness?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    margin?: number;
}

// Use forwardRef pattern to properly handle ref
export const Divider = forwardRef<HTMLDivElement, DividerProps>(({
                                                                     width = 100,
                                                                     color = "#e5e7eb",
                                                                     thickness = 1,
                                                                     style = "solid",
                                                                     margin = 10
                                                                 }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: DividerProps) => void) => void;

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

    return (
        <div ref={setCombinedRef} style={{ margin: `${margin}px`, padding: '4px 0' }}>
            <div
                style={{
                    width: `${width}%`,
                    margin: '0 auto',
                    cursor: 'move',
                    position: 'relative'
                }}
            >
                <hr
                    style={{
                        width: '100%',
                        borderTop: `${thickness}px ${style} ${color}`,
                        borderBottom: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        margin: 0
                    }}
                />
            </div>

            {selected && (
                <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Width (%)</Label>
                            <div className="pt-4">
                                <Slider
                                    value={[width]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={([value]) => typedSetProp((props: DividerProps) => {props.width = value;})}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>50</span>
                                    <span>100</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={e => typedSetProp((props: DividerProps) => {props.color = e.target.value;})}
                                    className="w-8 h-8 border-0"
                                />
                                <Input
                                    value={color}
                                    onChange={e => typedSetProp((props: DividerProps) => {props.color = e.target.value;})}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Thickness (px)</Label>
                            <div className="pt-4">
                                <Slider
                                    value={[thickness]}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onValueChange={([value]) => typedSetProp((props: DividerProps) => {props.thickness = value;})}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>5</span>
                                    <span>10</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Style</Label>
                            <Select
                                value={style}
                                onValueChange={(value: 'solid' | 'dashed' | 'dotted') => typedSetProp((props: DividerProps) => {props.style = value;})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="dashed">Dashed</SelectItem>
                                    <SelectItem value="dotted">Dotted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Margin</Label>
                            <div className="pt-4">
                                <Slider
                                    value={[margin]}
                                    min={0}
                                    max={40}
                                    step={1}
                                    onValueChange={([value]) => typedSetProp((props: DividerProps) => {props.margin = value;})}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>20</span>
                                    <span>40</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

// Add displayName for better debugging in React DevTools
Divider.displayName = 'Divider';

// Add Craft.js configuration
(Divider as any).craft = {
    props: {
        width: 100,
        color: "#e5e7eb",
        thickness: 1,
        style: "solid",
        margin: 10
    },
    related: {
        toolbar: false
    }
};