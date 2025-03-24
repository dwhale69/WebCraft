// components/SettingsPanel.tsx
import React from 'react';
import { useEditor, type EditorState } from "@craftjs/core";
import { Trash2, Settings2, Move } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Interface representing a selected node in the editor
 */
interface SelectedNode {
    /** Unique identifier for the node */
    id: string;
    /** Display name for the node from craft.js data */
    displayName: string;
    /** Node name from craft.js data */
    name: string;
    /** Component to render node settings UI */
    settings: React.ComponentType<any> | null;
    /** Whether the node can be deleted */
    isDeletable: boolean;
    /** Whether the node is currently hovered */
    isHovered: boolean;
}

/**
 * Editor state selector result interface
 */
interface EditorStateSelector {
    /** Currently selected node data */
    selected?: SelectedNode;
    /** Whether editor editing is enabled */
    isEnabled: boolean;
}

/**
 * Component for displaying and editing properties of selected elements
 */
export const SettingsPanel: React.FC = () => {
    const { actions, selected, isEnabled } = useEditor((state: EditorState, query): EditorStateSelector => {
        // Fix: TypeScript wants currentNodeId to be treated as a string, not a Set<string>
        const currentNodeId = state.events.selected.size > 0
            ? Array.from(state.events.selected)[0]
            : null;
        let selected: SelectedNode | undefined;

        if (currentNodeId) {
            // Extract node for cleaner access
            const node = state.nodes[currentNodeId];
            const nodeSettings = node?.related?.settings as React.ComponentType<any> | null;

            selected = {
                id: currentNodeId,
                displayName: node?.data?.displayName || '',
                name: node?.data?.name || '',
                settings: nodeSettings,
                isDeletable: query.node(currentNodeId).isDeletable(),
                isHovered: state.events.hovered ? state.events.hovered.has(currentNodeId) : false
            };
        }

        return {
            selected,
            isEnabled: state.options.enabled
        };
    });

    if (!selected) {
        return (
            <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <Settings2 className="h-8 w-8 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700">No Element Selected</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Select any element on the canvas to view and edit its properties
                </p>
            </div>
        );
    }

    /**
     * Renders the settings component for the selected node
     */
    const renderSettings = (): React.ReactNode => {
        if (!isEnabled) {
            return (
                <Alert variant="default" className="bg-yellow-50">
                    <AlertDescription>
                        Enable editing mode to modify properties
                    </AlertDescription>
                </Alert>
            );
        }

        if (!selected.settings) {
            return (
                <Alert variant="default" className="bg-blue-50">
                    <AlertDescription>
                        This element doesn't have editable properties
                    </AlertDescription>
                </Alert>
            );
        }

        // Create an instance of the settings component
        return React.createElement(selected.settings);
    };

    /**
     * Handles the delete button click
     */
    const handleDelete = (): void => {
        if (selected.id) {
            actions.delete(selected.id);
        }
    };

    return (
        <ScrollArea className="h-full">
            <div className="p-1">
                <Card className="border-0 shadow-none">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs font-normal px-2">
                                {selected.displayName || selected.name}
                            </Badge>
                            <Move className="h-4 w-4 text-gray-400" />
                        </div>
                        <CardTitle className="text-base mt-2">Element Settings</CardTitle>
                        <CardDescription className="text-xs">
                            Configure the selected element properties
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                        <Separator className="my-2" />
                        {renderSettings()}
                    </CardContent>

                    {selected.isDeletable && isEnabled && (
                        <CardFooter className="px-4 py-3 flex justify-end border-t">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                type="button"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Element
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </ScrollArea>
    );
};