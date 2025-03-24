// components/user/Button.tsx
import React, { forwardRef, useRef } from "react";
import { useNode } from "@craftjs/core";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface ButtonProps {
    text: string;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    intent?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light';
    fullWidth?: boolean;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    margin?: number;
    padding?: number;
    shadow?: boolean;
    onClick?: () => void;
}

// Convert to forwardRef pattern to properly handle refs
export const Button = forwardRef<HTMLDivElement, ButtonProps>(({
                                                                   text,
                                                                   size,
                                                                   variant,
                                                                   intent,
                                                                   fullWidth,
                                                                   backgroundColor,
                                                                   textColor,
                                                                   borderRadius,
                                                                   borderWidth,
                                                                   borderColor,
                                                                   margin,
                                                                   padding,
                                                                   shadow,
                                                                   onClick
                                                               }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: ButtonProps) => void) => void;

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
    const dragAreaRef = useRef<HTMLDivElement>(null);

    // Custom ref handler to merge the forwardedRef and connect ref
    const setContainerRef = (element: HTMLDivElement | null) => {
        // Set local ref
        if (containerRef) {
            containerRef.current = element;
        }

        // Connect to Craft.js
        if (element) {
            connect(element);
        }

        // Handle forwarded ref if it exists
        if (typeof forwardedRef === 'function') {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
    };

    // Custom ref handler for drag operations
    const setDragRef = (element: HTMLDivElement | null) => {
        // Set local drag ref
        if (dragAreaRef) {
            dragAreaRef.current = element;
        }

        // Connect to Craft.js drag system
        if (element) {
            drag(element);
        }
    };

    // Generate custom styles based on props
    const customStyles = {
        backgroundColor: backgroundColor || '',
        color: textColor || '',
        borderRadius: borderRadius ? `${borderRadius}px` : '',
        borderWidth: borderWidth ? `${borderWidth}px` : '',
        borderColor: borderColor || '',
        boxShadow: shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
        padding: padding ? `${padding}px` : ''
    };

    // Define intent-based classes that will add specific colors
    let intentClass = '';
    if (intent === 'primary') {
        intentClass = 'bg-blue-600 hover:bg-blue-700 text-white';
    } else if (intent === 'secondary') {
        intentClass = 'bg-purple-600 hover:bg-purple-700 text-white';
    } else if (intent === 'success') {
        intentClass = 'bg-green-600 hover:bg-green-700 text-white';
    } else if (intent === 'warning') {
        intentClass = 'bg-yellow-500 hover:bg-yellow-600 text-white';
    } else if (intent === 'danger') {
        intentClass = 'bg-red-600 hover:bg-red-700 text-white';
    } else if (intent === 'info') {
        intentClass = 'bg-cyan-500 hover:bg-cyan-600 text-white';
    } else if (intent === 'dark') {
        intentClass = 'bg-gray-800 hover:bg-gray-900 text-white';
    } else if (intent === 'light') {
        intentClass = 'bg-gray-100 hover:bg-gray-200 text-gray-800';
    }

    return (
        <div ref={setContainerRef} style={{ margin: `${margin}px` }}>
            <div ref={setDragRef} style={{ cursor: 'move', position: 'relative' }}>
                {/* Apply both Shadcn variants and our custom styles */}
                <ShadcnButton
                    size={size}
                    variant={variant}
                    className={`${fullWidth ? 'w-full' : ''} ${intentClass} transition-all duration-200`}
                    style={customStyles}
                    onClick={() => onClick && onClick()}
                >
                    {text}
                </ShadcnButton>

                {/* Add a visual indicator for the draggable area */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ opacity: selected ? 0.8 : 0 }}></div>
            </div>

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
                                    <Label>Button Text</Label>
                                    <Input
                                        value={text}
                                        onChange={e => typedSetProp((props: ButtonProps) => {props.text = e.target.value;})}
                                        className="w-full"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="style" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Size</Label>
                                    <Select
                                        value={size}
                                        onValueChange={(value: 'sm' | 'default' | 'lg') => typedSetProp((props: ButtonProps) => {props.size = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sm">Small</SelectItem>
                                            <SelectItem value="default">Medium</SelectItem>
                                            <SelectItem value="lg">Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Style</Label>
                                    <Select
                                        value={variant}
                                        onValueChange={(value: 'default' | 'outline' | 'ghost' | 'link') => typedSetProp((props: ButtonProps) => {props.variant = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select variant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="outline">Outline</SelectItem>
                                            <SelectItem value="ghost">Ghost</SelectItem>
                                            <SelectItem value="link">Link</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Intent</Label>
                                    <Select
                                        value={intent}
                                        onValueChange={(value: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light') => typedSetProp((props: ButtonProps) => {props.intent = value;})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select intent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="primary">Primary</SelectItem>
                                            <SelectItem value="secondary">Secondary</SelectItem>
                                            <SelectItem value="success">Success</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="danger">Danger</SelectItem>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="light">Light</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={backgroundColor || '#ffffff'}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.backgroundColor = e.target.value;})}
                                            className="w-10 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={backgroundColor || ''}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.backgroundColor = e.target.value;})}
                                            placeholder="#hex or color name"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={textColor || '#000000'}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.textColor = e.target.value;})}
                                            className="w-10 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={textColor || ''}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.textColor = e.target.value;})}
                                            placeholder="#hex or color name"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={fullWidth}
                                            onCheckedChange={checked => typedSetProp((props: ButtonProps) => {props.fullWidth = checked;})}
                                        />
                                        <Label>Full Width</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={shadow}
                                            onCheckedChange={checked => typedSetProp((props: ButtonProps) => {props.shadow = checked;})}
                                        />
                                        <Label>Add Shadow</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Margin</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[margin || 0]}
                                            min={0}
                                            max={40}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ButtonProps) => {props.margin = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Padding</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[padding || 8]}
                                            min={4}
                                            max={24}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ButtonProps) => {props.padding = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>4</span>
                                            <span>12</span>
                                            <span>24</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderRadius || 4]}
                                            min={0}
                                            max={24}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ButtonProps) => {props.borderRadius = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>12</span>
                                            <span>24</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Width</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderWidth || 0]}
                                            min={0}
                                            max={5}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ButtonProps) => {props.borderWidth = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>2</span>
                                            <span>5</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={borderColor || '#000000'}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.borderColor = e.target.value;})}
                                            className="w-10 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={borderColor || ''}
                                            onChange={e => typedSetProp((props: ButtonProps) => {props.borderColor = e.target.value;})}
                                            placeholder="#hex or color name"
                                            className="flex-1"
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
Button.displayName = 'Button';

// Add Craft.js configuration
(Button as any).craft = {
    props: {
        text: "Click Me",
        size: "default",
        variant: "default",
        intent: "primary",
        fullWidth: false,
        backgroundColor: "",
        textColor: "",
        borderRadius: 4,
        borderWidth: 0,
        borderColor: "",
        margin: 0,
        padding: 8,
        shadow: false,
        onClick: () => {}
    },
    related: {
        toolbar: true
    }
};