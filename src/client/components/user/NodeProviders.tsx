// src/components/user/NodeProviders.tsx
import React from 'react';
import { useEditor } from '@craftjs/core';

// Import all your user components with their proper types
import { Button, type ButtonProps } from './Button';
import { Container, type ContainerProps } from './Container';
import { Divider, type DividerProps } from './Divider';
import { Flexbox, type FlexboxProps } from './Flexbox';
import { Heading, type HeadingProps } from './Heading';
import { Image, type ImageProps } from './Image';
import { Paragraph, type ParagraphProps } from './Paragraph';
import { Section, type SectionProps } from './Section';
import { Text, type TextProps } from './Text';

// Type for CraftJS node component with craft property
interface CraftComponent<P> extends React.FC<P> {
    craft: {
        props: Record<string, any>;
        related?: Record<string, any>;
        rules?: Record<string, any>;
        displayName?: string;
    };
}

// Create node provider components that only render when inside Craft.js editor
export const ButtonNode: CraftComponent<ButtonProps> = (props) => {
    const { connectors, query } = useEditor();
    // The component name has to match the serialized JSON format
    return <Button {...props} />;
};
ButtonNode.craft = {
    ...(Button as any).craft,
    displayName: 'Button', // Important for matching JSON serialization
};

export const ContainerNode: CraftComponent<ContainerProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Container {...props} />;
};
ContainerNode.craft = {
    ...(Container as any).craft,
    displayName: 'Container',
};

export const DividerNode: CraftComponent<DividerProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Divider {...props} />;
};
DividerNode.craft = {
    ...(Divider as any).craft,
    displayName: 'Divider',
};

export const FlexboxNode: CraftComponent<FlexboxProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Flexbox {...props} />;
};
FlexboxNode.craft = {
    ...(Flexbox as any).craft,
    displayName: 'Flexbox',
};

export const HeadingNode: CraftComponent<HeadingProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Heading {...props} />;
};
HeadingNode.craft = {
    ...(Heading as any).craft,
    displayName: 'Heading',
};

export const ImageNode: CraftComponent<ImageProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Image {...props} />;
};
ImageNode.craft = {
    ...(Image as any).craft,
    displayName: 'Image',
};

export const ParagraphNode: CraftComponent<ParagraphProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Paragraph {...props} />;
};
ParagraphNode.craft = {
    ...(Paragraph as any).craft,
    displayName: 'Paragraph',
};

export const SectionNode: CraftComponent<SectionProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Section {...props} />;
};
SectionNode.craft = {
    ...(Section as any).craft,
    displayName: 'Section',
};

export const TextNode: CraftComponent<TextProps> = (props) => {
    const { connectors, query } = useEditor();
    return <Text {...props} />;
};
TextNode.craft = {
    ...(Text as any).craft,
    displayName: 'Text',
};