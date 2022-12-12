import React, { useState, useCallback, useMemo } from 'react';
import { createEditor, Editor, Text, Range, Element as SlateElement, Node as SlateNode, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import isHotKey from 'is-hotkey';
import { Button, Toolbar } from './CustomElement';
import { Icons } from './Icons';
import { Icon, Popover, Tooltip } from '@shopify/polaris';
import { DropdownMinor } from '@shopify/polaris-icons';
import { withHistory } from 'slate-history';
import escapeHtml from 'escape-html';
import { jsx } from 'slate-hyperscript';

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline'
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const serialize = node => {
    if (Text.isText(node)) {
        let string = escapeHtml(node.text)
        if (node.bold) string = `<strong>${string}</strong>`
        if (node.italic) string = `<em>${string}</em>`
        if (node.underline) string = `<u>${string}</u>`
        return string
    }

    const children = node.children.map(n => serialize(n)).join('');

    switch (node.type) {
        case 'bulleted-list':
            return `<ul${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</ul>`
        case 'numbered-list':
            return `<ol${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</ol>`
        case 'list-item':
            return `<li${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</li>`
        case 'heading-one':
            return `<h1${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</h1>`
        case 'heading-two':
            return `<h2${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</h2>`
        case 'heading-three':
            return `<h3${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</h3>`
        case 'heading-four':
            return `<h4${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</h4>`            
        case 'link':
            return `<a href="${escapeHtml(node.url)}">${children}</a>`
        default:
            return `<p${node.align ? ' style="text-align:'+node.align+'"' : ''}>${children}</p>`
    }
};

const deserialize = (el, markAttributes = {}) => {
    if (el.nodeType === Node.TEXT_NODE) {
        return jsx('text', markAttributes, el.textContent)
    } else if (el.nodeType !== Node.ELEMENT_NODE) {
        return null
    }

    const nodeAttributes = { ...markAttributes }

    if (el.nodeName === 'STRONG') nodeAttributes.bold = true
    if (el.nodeName === 'EM') nodeAttributes.italic = true
    if (el.nodeName === 'U') nodeAttributes.underline = true

    const children = Array.from(el.childNodes)
        .map(node => deserialize(node, nodeAttributes))
        .flat()

    if (children.length === 0) children.push(jsx('text', nodeAttributes, ''))

    let props = {}
    if(el.style?.textAlign) props.align = el.style.textAlign;

    switch (el.nodeName) {
        case 'BODY':
          return jsx('fragment', {}, children)
        case 'UL':
            return jsx('element', { type: 'bulleted-list', ...props }, children)
        case 'OL':
            return jsx('element', { type: 'numbered-list', ...props }, children)
        case 'LI':
            return jsx('element', { type: 'list-item', ...props }, children)
        case 'H1':
            return jsx('element', { type: 'heading-one', ...props }, children)
        case 'H2':
            return jsx('element', { type: 'heading-two', ...props }, children)
        case 'H3':
            return jsx('element', { type: 'heading-three', ...props }, children)
        case 'H4':
            return jsx('element', { type: 'heading-four', ...props }, children)
        case 'P':
            return jsx('element', { type: 'paragraph', ...props }, children)
        case 'A':
            return jsx(
                'element',
                { type: 'link', url: el.getAttribute('href') },
                children
            )
        default:
            return children
    }
}

const Element = ({ attributes, children, element }) => {
    const style = { textAlign: element.align };    

    switch (element.type) {
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            )

        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            )

        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            )

        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            )

        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            )

        case 'heading-three':
            return (
                <h3 style={style} {...attributes}>
                    {children}
                </h3>
            )

        case 'heading-four':
            return (
                <h4 style={style} {...attributes}>
                    {children}
                </h4>
            )

        case 'link':
                return (
                  <a {...attributes} href={element.url}>
                    {children}
                  </a>
                )

        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            )
    }
}

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>
    
    return <span {...attributes}>{children}</span>
}

const editorAction = {
    isMarkActive(editor, format) {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    },

    toggleMark(editor, format) {
        const isActive = editorAction.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format)
        } else {
            Editor.addMark(editor, format, true);
        }
    },

    isBlockActive(editor, format, blockType = 'type') {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n[blockType] === format
            })
        )
        return !!match;
    },

    toggleBlock(editor, format) {
        const isActive = editorAction.isBlockActive(
            editor,
            format,
            TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
        );
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type) &&
                !TEXT_ALIGN_TYPES.includes(format),
            split: true
        })

        let newProperties;

        if (TEXT_ALIGN_TYPES.includes(format)) {
            newProperties = {
                align: isActive ? undefined : format
            }
        } else {
            newProperties = {
                type: isActive ? undefined : isList ? 'list-item' : format
            }
        }

        Transforms.setNodes(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    },

    isLinkActive(editor) {
        const [link] = Editor.nodes(editor, {
            match: n => 
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'link'
        })

        return !!link;
    },

    insertLink(editor, url) {
        const link = {
            type: 'link',
            url,
            children: []
        }
        Transforms.wrapNodes(editor, link, { split: true });
        Transforms.collapse(editor, { edge: 'end' });
    },

    removeLink(editor) {
        Transforms.unwrapNodes(editor, {
            match: n => 
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'link'
        })
    }
}

const withInlines = editor => {
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === 'link' || isInline(element);

    return editor;
}

const withDeleteEmptyBlock = (editor) => {
    const { deleteBackward } = editor;

    editor.deleteBackward = (unit) => {
        const { selection } = editor;

        if (selection && selection.focus.offset === 0 && selection.anchor.offset === 0 && Range.isCollapsed(selection)) {
            const node = editor.children[selection.anchor.path[0]];
            if ((LIST_TYPES.includes(node?.type) || node?.type === 'list-item') && node.children.length === 1) {
                editorAction.toggleBlock(editor, node.type);
            }
            deleteBackward(unit);
        } else {
            deleteBackward(unit);
        }
    };

    return editor;
};

const withDeleteEmptyLink = (editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
        const [node, path] = entry
        if (SlateElement.isElement(node)) {
            const children = Array.from(SlateNode.children(editor, path));
            for (const [child, childPath] of children) {
                if (SlateElement.isElement(child) && child.type === 'link' && child.children[0].text === '') {
                    Transforms.removeNodes(editor, { at: childPath });
                    return;
                }
            }
        }
        normalizeNode(entry);
    }

    return editor;
}

export function TextEditor({ content }) {
    const [popoverActive, setPopoverActive] = useState(false);
    const [defaultValue, setDefaultValue] = useState(null);
    const [count, setCount] = useState(0);

    const editor = useMemo(() => withInlines(withDeleteEmptyLink(withDeleteEmptyBlock(withHistory(withReact(createEditor()))))), [])

    if(!defaultValue) {
        let document = new DOMParser().parseFromString(content.value || '<p></p>', 'text/html');
        setDefaultValue(deserialize(document.body));
    }

    const renderElement = useCallback(props => <Element {...props} />, []);

    const renderLeaf = useCallback(props => <Leaf {...props} />, []);

    const togglePopover = useCallback(() => {
        setPopoverActive((popoverActive) => !popoverActive)
    }, []);

    const popoverActivator = (
        <button onClick={togglePopover} className={`editor-tool-options${popoverActive ? ' editor-options-opened' : ''}`}><SelectedBlock /><div><Icon color='base' source={DropdownMinor} /></div></button>
    );
    
    const changeValue = (value) => {
        const isValueChange = editor.operations.some(
            op => 'set_selection' !== op.type
        );
        
        if (isValueChange) {
            const html = value.map(node => serialize(node)).join('');
            content.onChange(html);
        }
    }

    content.reset = () => {
        if(!defaultValue) return;
        editor.selection = null;
        editor.children = defaultValue;
        setCount((count) => count + 1);
        content.dirty = false;
    }
    
    return (
        <Slate
            editor={editor}
            value={defaultValue}
            onChange={(value) => changeValue(value)}
        >
            <Toolbar className="editor-toolbar">
                <div className='editor-tool-group'>
                    <Popover
                        active={popoverActive}
                        activator={popoverActivator}
                        onClose={togglePopover}
                    >
                        <ul className='editor-tool-list'>
                            <li><OptionButton format='paragraph' label='Paragraph' onSelectOption={togglePopover} /></li>
                            <li><OptionButton className='editor-preview-h1' format='heading-one' label='Heading 1' onSelectOption={togglePopover} /></li>
                            <li><OptionButton className='editor-preview-h2' format='heading-two' label='Heading 2' onSelectOption={togglePopover} /></li>
                            <li><OptionButton className='editor-preview-h3' format='heading-three' label='Heading 3' onSelectOption={togglePopover} /></li>
                            <li><OptionButton className='editor-preview-h4' format='heading-four' label='Heading 4' onSelectOption={togglePopover} /></li>
                        </ul>
                    </Popover>
                </div>

                <div className='editor-tool-group'>
                    <Tooltip content="Bold" preferredPosition='above'>
                        <MarkButton format="bold" icon="bold" />
                    </Tooltip>
                    <Tooltip content="Italic" preferredPosition='above'>
                        <MarkButton format="italic" icon="italic" />
                    </Tooltip>
                    <Tooltip content="Underline" preferredPosition='above'>
                        <MarkButton format="underline" icon="underline" />
                    </Tooltip>
                </div>

                <div className='editor-tool-group'>
                    <Tooltip content="Left align" preferredPosition='above'>
                        <BlockButton format="left" icon="left-align" />
                    </Tooltip>
                    <Tooltip content="Center align" preferredPosition='above'>
                        <BlockButton format="center" icon="center-align" />
                    </Tooltip>
                    <Tooltip content="Right align" preferredPosition='above'>
                        <BlockButton format="right" icon="right-align" />
                    </Tooltip>
                </div>

                <div className='editor-tool-group'>
                    <Tooltip content="Bulleted list" preferredPosition='above'>
                        <BlockButton format="bulleted-list" icon="bulleted-list" />
                    </Tooltip>
                    <Tooltip content="Numbered list" preferredPosition='above'>
                        <BlockButton format="numbered-list" icon="numbered-list" />
                    </Tooltip>
                </div>

                <div className='editor-tool-group'>
                    <LinkButton />
                </div>
            </Toolbar>
            <Editable
                className='editor-markup'
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onKeyDown={event => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotKey(hotkey, event)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            editorAction.toggleMark(editor, mark);
                        }
                    }
                }}
            />
        </Slate>
    );
}

const SelectedBlock = () => {
    const editor = useSlate();
    const { selection } = editor;

    if(!selection) return 'Paragraph';
    if (selection?.anchor.path[0] !== selection?.focus.path[0]) return 'Paragraph';

    let activeBlock =
        editorAction.isBlockActive(editor, 'heading-one') ? 'Heading 1'
            : editorAction.isBlockActive(editor, 'heading-two') ? 'Heading 2'
                : editorAction.isBlockActive(editor, 'heading-three') ? 'Heading 3'
                    : editorAction.isBlockActive(editor, 'heading-four') ? 'Heading 4'
                        : 'Paragraph';

    return activeBlock;
}

const MarkButton = ({ format, icon }) => {
    const editor = useSlate();

    return (
        <Button
            className={`editor-tool${editorAction.isMarkActive(editor, format) ? ' editor-tool-active' : ''}`}
            onClick={event => {
                event.preventDefault();
                editorAction.toggleMark(editor, format)
            }}
        >
            <Icons icon={icon} />
        </Button>
    )
}

const OptionButton = ({ className, format, label, onSelectOption }) => {
    const editor = useSlate();
    const { selection } = editor;
    let isActive;
    if (selection?.anchor.path[0] !== selection?.focus.path[0]) {
        isActive = false;
    } else {
        isActive = editorAction.isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
    }

    return (
        <button
            className={`${className}${isActive ? ' editor-option-active' : ''}`}
            onClick={event => {
                event.preventDefault();
                editorAction.toggleBlock(editor, format)
                onSelectOption();
            }}
        >
            {isActive && (
                <div className='editor-option-selected-mark'><Icons icon='checkmark' /></div>
            )}
            {label}
        </button>
    )
}

const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    const isActive = editorAction.isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');

    return (
        <Button
            className={`editor-tool${isActive ? ' editor-tool-active' : ''}`}
            onClick={event => {
                event.preventDefault();
                editorAction.toggleBlock(editor, format)
            }}
        >
            <Icons icon={icon} />
        </Button>
    )
}

const LinkButton = () => {
    const editor = useSlate();
    const { selection } = editor;
    let isActive = editorAction.isLinkActive(editor);
    let isEnable = false;

    if (!!selection) {
        isEnable = !Range.isCollapsed(selection);
        isEnable = isActive ? isActive : isEnable;
    }

    const buttonMarkup = (
        <button
            disabled={!isEnable}
            className={`editor-tool${isActive ? ' editor-tool-active' : ''}`}
            onClick={() => {
                if(isActive) {
                    editorAction.removeLink(editor);
                } else {
                    const url = prompt("Enter a URL");
                    if(!url) return;
                    editorAction.insertLink(editor, url);
                }                
            }}
        >
            <Icons icon='link' />
        </button>
    );

    if(isEnable) {
        return (
            <Tooltip content={isActive ? 'Remove link' : 'Insert link'} preferredPosition='above'>{buttonMarkup}</Tooltip>
        );
    }
    
    return buttonMarkup;
}