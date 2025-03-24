// components/user/Image.tsx
import React, { forwardRef, useRef } from "react";
import { useNode } from "@craftjs/core";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the type for objectFit
type ObjectFitValue = 'cover' | 'contain' | 'fill';

export interface ImageProps {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    borderRadius?: number;
    margin?: number;
    objectFit?: ObjectFitValue;
}

// Use forwardRef pattern to properly handle ref
export const Image = forwardRef<HTMLDivElement, ImageProps>(({
                                                                 src = "",
                                                                 alt = "Image",
                                                                 width = 320,
                                                                 height = 240,
                                                                 borderRadius = 0,
                                                                 margin = 0,
                                                                 objectFit = "cover"
                                                             }, forwardedRef) => {
    // Add explicit type definition
    type SetPropType = (cb: (props: ImageProps) => void) => void;

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
        <div
            ref={setCombinedRef}
            style={{ margin: `${margin}px` }}
        >
            <img
                src={src || "/api/placeholder/400/300"}
                alt={alt || "Image"}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    borderRadius: `${borderRadius}px`,
                    objectFit
                }}
                className="border border-gray-200"
            />

            {selected && (
                <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                        <Tabs defaultValue="source" className="w-full">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="source">Source</TabsTrigger>
                                <TabsTrigger value="display">Display</TabsTrigger>
                            </TabsList>

                            <TabsContent value="source" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Image URL</Label>
                                    <Input
                                        value={src || ""}
                                        onChange={e => typedSetProp((props: ImageProps) => {props.src = e.target.value;})}
                                        className="w-full"
                                        placeholder="Enter image URL"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Alt Text</Label>
                                    <Input
                                        value={alt || ""}
                                        onChange={e => typedSetProp((props: ImageProps) => {props.alt = e.target.value;})}
                                        className="w-full"
                                        placeholder="Describe the image"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="display" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Width (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[width]}
                                            min={50}
                                            max={800}
                                            step={10}
                                            onValueChange={([value]) => typedSetProp((props: ImageProps) => {props.width = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>50</span>
                                            <span>400</span>
                                            <span>800</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Height (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[height]}
                                            min={50}
                                            max={600}
                                            step={10}
                                            onValueChange={([value]) => typedSetProp((props: ImageProps) => {props.height = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>50</span>
                                            <span>300</span>
                                            <span>600</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Border Radius (px)</Label>
                                    <div className="pt-4">
                                        <Slider
                                            value={[borderRadius]}
                                            min={0}
                                            max={40}
                                            step={1}
                                            onValueChange={([value]) => typedSetProp((props: ImageProps) => {props.borderRadius = value;})}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20</span>
                                            <span>40</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Object Fit</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['cover', 'contain', 'fill'] as const).map(fit => (
                                            <button
                                                key={fit}
                                                type="button"
                                                className={`py-2 px-3 text-sm rounded-md border ${
                                                    objectFit === fit
                                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                        : 'bg-white border-gray-300 text-gray-700'
                                                }`}
                                                onClick={() => typedSetProp((props: ImageProps) => {props.objectFit = fit;})}
                                            >
                                                {fit.charAt(0).toUpperCase() + fit.slice(1)}
                                            </button>
                                        ))}
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
                                            onValueChange={([value]) => typedSetProp((props: ImageProps) => {props.margin = value;})}
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
Image.displayName = 'Image';

// Component default props and Craft.js configuration
(Image as any).craft = {
    props: {
        src: "",
        alt: "Image",
        width: 320,
        height: 240,
        borderRadius: 0,
        margin: 0,
        objectFit: "cover"
    },
    related: {
        toolbar: false
    }
};