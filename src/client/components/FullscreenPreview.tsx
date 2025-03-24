// src/components/FullscreenPreview.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useEditor } from "@craftjs/core";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FullscreenPreviewProps {
    fullscreenMode: boolean;
    setFullscreenMode: (mode: boolean) => void;
}

export const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ fullscreenMode, setFullscreenMode }) => {
    const { query } = useEditor();
    const [editorContent, setEditorContent] = useState<string>('');
    const [cssStyles, setCssStyles] = useState<string>('');
    const previewRef = useRef<HTMLDivElement | null>(null);

    // Get the editor content and styles when fullscreen mode is activated
    useEffect(() => {
        if (fullscreenMode) {
            // Use a slightly longer timeout to ensure DOM is fully ready after JSON import
            const timer = setTimeout(() => {
                console.log('Starting to capture editor content for fullscreen mode');

                // Based on the HTML structure you provided, we need to look for the canvas container
                // which contains the actual rendered content
                const canvasContainer = document.querySelector('.min-h-\\[600px\\] .p-0.h-full');

                // If we found the canvas container
                if (canvasContainer) {
                    console.log('Found canvas container:', canvasContainer);
                    try {
                        // Clone the element to avoid modifying the original
                        const clone = canvasContainer.cloneNode(true) as Element;

                        // Remove any editor-specific attributes or classes
                        const editableElements = clone.querySelectorAll('[contenteditable="true"]');
                        editableElements.forEach(el => {
                            el.removeAttribute('contenteditable');
                            (el as HTMLElement).style.outline = 'none';
                            (el as HTMLElement).style.border = 'none';
                        });

                        // Find and remove editor UI elements and grid overlay
                        const editorUIElements = clone.querySelectorAll(
                            '.craft-block-indicator, .craft-hover-indicator, .craft-selected-indicator, ' +
                            '.pointer-events-none.z-10, .card-header, .card-footer'
                        );
                        editorUIElements.forEach(el => {
                            el.parentNode?.removeChild(el);
                        });

                        // Remove any draggable attributes and cursor:move styles
                        const draggableElements = clone.querySelectorAll('[draggable="true"]');
                        draggableElements.forEach(el => {
                            el.removeAttribute('draggable');
                        });

                        const moveElements = clone.querySelectorAll('[style*="cursor: move"]');
                        moveElements.forEach(el => {
                            (el as HTMLElement).style.cursor = 'default';
                        });

                        // Clean up other editor artifacts
                        const styleCleanup = `
                            [draggable], [contenteditable], [data-cy] {
                                cursor: default !important;
                                outline: none !important;
                                border: none !important;
                            }
                            [style*="cursor: move"] {
                                cursor: default !important;
                            }
                        `;

                        // Set the cleaned content
                        setEditorContent(clone.outerHTML);
                        console.log('Successfully captured editor content');

                        // Get CSS styles from the current document
                        const styles = Array.from(document.styleSheets)
                            .filter(sheet => {
                                try {
                                    return !sheet.href || sheet.href.startsWith(window.location.origin);
                                } catch (e) {
                                    return false;
                                }
                            })
                            .map(sheet => {
                                try {
                                    return Array.from(sheet.cssRules)
                                        .map(rule => rule.cssText)
                                        .join('\n');
                                } catch (e) {
                                    console.warn('Could not access some CSS rules', e);
                                    return '';
                                }
                            })
                            .join('\n') + styleCleanup;

                        setCssStyles(styles);
                    } catch (error) {
                        console.error('Error processing editor content:', error);
                        setEditorContent('<div>Error processing content: ' + (error as Error).message + '</div>');
                    }
                } else {
                    console.warn('Could not find main canvas container');

                    // Try an alternative approach - find the card that contains the main content
                    const cardContent = document.querySelector('.rounded-xl.border.bg-card.min-h-\\[600px\\]');
                    if (cardContent) {
                        console.log('Found card content as fallback:', cardContent);
                        // Clone and clean up the card content
                        const clone = cardContent.cloneNode(true) as Element;

                        // Remove the grid overlay if it exists
                        const gridOverlay = clone.querySelector('.absolute.inset-0.pointer-events-none.z-10');
                        if (gridOverlay && gridOverlay.parentNode) {
                            gridOverlay.parentNode.removeChild(gridOverlay);
                        }

                        setEditorContent(clone.outerHTML);
                    } else {
                        // Last resort - try to get any main content
                        const mainContent = document.querySelector('.container.mx-auto.p-6.max-w-6xl');
                        if (mainContent) {
                            console.log('Using main container as last resort');
                            // We need to remove the controls
                            const clone = mainContent.cloneNode(true) as Element;
                            const controls = clone.querySelector('.mb-6');
                            if (controls && controls.parentNode) {
                                controls.parentNode.removeChild(controls);
                            }
                            setEditorContent(clone.outerHTML);
                        } else {
                            setEditorContent('<div class="p-4 text-center"><h2 class="text-xl font-bold mb-4">No content available</h2><p>Could not find editor elements. Please try refreshing the page.</p></div>');
                        }
                    }
                }
            }, 500); // Longer timeout for better reliability after JSON import

            return () => clearTimeout(timer);
        } else {
            // Reset content when exiting fullscreen
            setEditorContent('');
            setCssStyles('');
        }
    }, [fullscreenMode]);

    // When not in fullscreen mode, don't render anything
    if (!fullscreenMode) return null;

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-auto flex flex-col">
            <div className="bg-gray-100 p-3 flex justify-between items-center shadow-sm">
                <h2 className="text-lg font-medium">Full Screen Preview</h2>

                <div className="flex items-center gap-2">
                    {/* Add responsive view toggle buttons if needed */}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (previewRef.current) {
                                try {
                                    // Get the iframe document
                                    const iframe = previewRef.current.querySelector('iframe');
                                    if (iframe) {
                                        // Create a new blob with the iframe content
                                        const html = iframe.getAttribute('srcdoc');
                                        if (html) {
                                            const blob = new Blob([html], {type: 'text/html'});
                                            const url = URL.createObjectURL(blob);

                                            // Open in new tab
                                            window.open(url, '_blank');
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error opening in new tab:", e);
                                }
                            }
                        }}
                    >
                        Open in New Tab
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => setFullscreenMode(false)}
                        className="flex items-center"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Close Preview
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
                <div className="craft-preview" ref={previewRef} style={{ width: '100%', height: '100%' }}>
                    <iframe
                        srcDoc={`
                            <html>
                                <head>
                                    <meta charset="utf-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Design Preview</title>
                                    
                                    <!-- Include Tailwind CSS -->
                                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                                    
                                </head>
                                <body>
                                    <div id="preview-wrapper">
                                        ${editorContent}
                                    </div>
                                </body>
                            </html>
                        `}
                        style={{ width: '100%', height: '100vh', border: 'none' }}
                        title="Fullscreen Preview"
                        sandbox="allow-same-origin allow-scripts"
                    />
                </div>
            </div>
        </div>
    );
};