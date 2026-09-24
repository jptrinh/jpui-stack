export default {
    editor: {
        label: {
            en: "Stack",
        },
        icon: "inbox-in",
        customSettingsPropertiesOrder: [
            "group",
            "items",
            "sortable",
            "readonly",
            "customDragHandle",
            ["handleClass"],
        ],
        customStylePropertiesOrder: [
            "layout",
            "direction",
            "wrap",
            "gridTemplateColumns",
            "rowGap",
            "columnGap",
            "gap",
            "animation",
            "showHeader",
            "showFooter",
            {
                label: "Drop preview",
                isCollapsible: true,
                properties: ["previewBorder", "previewBorderRadius", "previewBackground"],
            },
        ]
    },
    states: ['readonly'],
    triggerEvents: [
        {
            name: "item:moved",
            label: { en: "On item moved" },
            event: {
                item: {},
                oldIndex: 0,
                newIndex: 1,
                updatedList: [],
            },
        },
        {
            name: "item:added",
            label: { en: "On item added" },
            event: {
                item: {},
                newIndex: 1,
                updatedList: [],
            },
        },
        {
            name: "item:removed",
            label: { en: "On item removed" },
            event: {
                item: {},
                oldIndex: 0,
                updatedList: [],
            },
        },
    ],
    properties: {
        group: {
            hidden: (content, sidePanelContent, boundProps, wwProps) => !!(wwProps && wwProps.group),
            label: {
                en: "Group",
            },
            type: "Text",
            bindable: true,
            defaultValue: "common",
            section: "settings",
        },
        items: {
            hidden: (content, sidePanelContent, boundProps, wwProps) => !!(wwProps && wwProps.items),
            label: {
                en: "Items",
            },
            type: "Info",
            options: {
                text: { en: "Bind your data" },
            },
            bindable: true,
            defaultValue: [],
            section: "settings",
        },
        sortable: {
            hidden: (content, sidePanelContent, boundProps, wwProps) => !!(wwProps && wwProps.sortable),
            label: {
                en: "Sortable",
            },
            type: "OnOff",
            defaultValue: true,
            section: "settings",
        },
        layout: {
            label: {
                en: "Layout",
            },
            type: "TextSelect",
            options: {
                options: [
                    { value: "flex", label: { en: "Flex (row / column)" } },
                    { value: "grid", label: { en: "Grid" } },
                ],
            },
            bindable: true,
            defaultValue: "flex",
            section: "style",
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: 'How items are laid out: `"flex" | "grid"`',
            },
            /* wwEditor:end */
        },
        direction: {
            hidden: content => content?.layout === "grid",
            label: {
                en: "Direction",
            },
            type: "TextSelect",
            options: {
                options: [
                    { value: "vertical", label: { en: "Vertical" } },
                    { value: "horizontal", label: { en: "Horizontal" } },
                ],
            },
            bindable: true,
            defaultValue: "vertical",
            section: "style",
        },
        wrap: {
            hidden: content => content?.layout === "grid",
            label: {
                en: "Wrap",
            },
            type: "OnOff",
            bindable: true,
            defaultValue: false,
            section: "style",
        },
        gridTemplateColumns: {
            hidden: content => content?.layout !== "grid",
            label: {
                en: "Grid columns",
            },
            type: "Text",
            bindable: true,
            defaultValue: "repeat(auto-fill, minmax(128px, 1fr))",
            section: "style",
            options: {
                placeholder: "repeat(auto-fill, minmax(128px, 1fr))",
            },
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip:
                    'A CSS grid-template-columns value: `"repeat(auto-fill, minmax(128px, 1fr))" | "repeat(3, 1fr)" | "200px 1fr"`',
            },
            propertyHelp: {
                tooltip:
                    "Any CSS `grid-template-columns` value. `repeat(auto-fill, minmax(128px, 1fr))` fits as many columns of at least 128px as the width allows and stretches them to fill the row.",
            },
            /* wwEditor:end */
        },
        rowGap: {
            label: {
                en: "Row gap",
            },
            type: "Length",
            options: {
                unitChoices: [
                    { value: "px", label: "px", min: 0, max: 200 },
                    { value: "rem", label: "rem", min: 0, max: 10 },
                ],
                noRange: true,
                useVar: true,
            },
            bindable: true,
            responsive: true,
            section: "style",
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: 'A CSS length: `"12px" | "0.75rem" | "var(--my-token, 12px)"`. Empty = the legacy Gap value.',
            },
            /* wwEditor:end */
        },
        columnGap: {
            label: {
                en: "Column gap",
            },
            type: "Length",
            options: {
                unitChoices: [
                    { value: "px", label: "px", min: 0, max: 200 },
                    { value: "rem", label: "rem", min: 0, max: 10 },
                ],
                noRange: true,
                useVar: true,
            },
            bindable: true,
            responsive: true,
            section: "style",
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: 'A CSS length: `"10px" | "0.625rem" | "var(--my-token, 10px)"`. Empty = the legacy Gap value.',
            },
            /* wwEditor:end */
        },
        // Legacy single gap in px, kept so existing instances don't change; Row gap / Column gap take over when set
        gap: {
            hidden: true,
            label: {
                en: "Gap",
            },
            type: "Number",
            options: {
                min: 0,
            },
            bindable: true,
            defaultValue: 0,
            section: "style",
        },
        animation: {
            label: {
                en: "Sort animation (ms)",
            },
            type: "Number",
            options: {
                min: 0,
                max: 1000,
                step: 50,
            },
            bindable: true,
            defaultValue: 150,
            section: "style",
            /* wwEditor:start */
            bindingValidation: {
                type: "number",
                tooltip: "Duration in ms of the animation of the other items while dragging (0 = none)",
            },
            /* wwEditor:end */
        },
        itemElement: {
            hidden: true,
            defaultValue: [{ isWwObject: true, type: "ww-flexbox" }],
            navigator: {
                group: "Item",
            },
        },
        readonly: {
            label: { en: "Read only", fr: "Lecture seule" },
            type: "OnOff",
            section: "settings",
            bindable: true,
            defaultValue: false,
            /* wwEditor:start */
            bindingValidation: {
                type: "boolean",
                tooltip: "A boolean that defines if the input is in readonly: `true | false`",
            },
            /* wwEditor:end */
        },
        customDragHandle: {
            label: 'Custom drag',
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            propertyHelp: {
                tooltip: `By default, dragging is triggered when a user clicks anywhere on a Kanban item. To trigger the dragging behavior on click of a specific element inside the item:  
* Enable this option  
* Go to that element’s Settings > HTML attributes 
* Add the class you choose to its Class attribute (default: 'draggable'))`
            },
            hidden: (content, sidePanelContent, boundProps, wwProps) => wwProps?.handle?.length,
        },
        handleClass: {
            label: "Class name",
            type: "Text",
            bindable: true,
            section: "settings",
            defaultValue: "draggable",
            propertyHelp: {
                tooltip: 'This class must be added on elements to trigger the drag&drop. (Settings > HTML attributes > Class)'
            },
            options: {
                placeholder: "draggable",
            },
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: "A string that represent the class of the handle",
            },
            /* wwEditor:end */
            hidden: (content, sidePanelContent, boundProps, wwProps) => !content.customDragHandle || wwProps?.handle?.length,
        },
        showHeader: {
            label: { en: "Header" },
            type: "OnOff",
            section: "style",
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: "boolean",
                tooltip: "A boolean to show/hide the header dropzone: `true | false`",
            },
            /* wwEditor:end */
        },
        headerContent: {
            hidden: true,
            defaultValue: [],
            navigator: {
                group: "Header",
            },
        },
        showFooter: {
            label: { en: "Footer" },
            type: "OnOff",
            section: "style",
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: "boolean",
                tooltip: "A boolean to show/hide the footer dropzone: `true | false`",
            },
            /* wwEditor:end */
        },
        footerContent: {
            hidden: true,
            defaultValue: [],
            navigator: {
                group: "Footer",
            },
        },
        previewBorder: {
            label: { en: "Preview border" },
            type: "Border",
            section: "style",
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: "2px dashed #9CA3AF",
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: "border",
                type: "string",
                tooltip: "A CSS border shorthand for the drop preview: `2px dashed #9CA3AF` | `none`",
            },
            propertyHelp: {
                tooltip: "Border of the dashed drop-placeholder shown where the item will land.",
            },
            /* wwEditor:end */
        },
        previewBorderRadius: {
            label: { en: "Preview border radius" },
            type: "Spacing",
            section: "style",
            options: {
                unitChoices: [
                    { value: "px", label: "px", min: 0, max: 100 },
                    { value: "%", label: "%", min: 0, max: 100 },
                ],
                isCorner: true,
                noRange: true,
                useVar: true,
            },
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            defaultValue: "0px",
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: "A CSS border-radius value with unit, e.g. `8px`",
            },
            propertyHelp: {
                tooltip: "Corner radius of the drop-placeholder.",
            },
            /* wwEditor:end */
        },
        previewBackground: {
            label: { en: "Preview background" },
            type: "Color",
            bindable: true,
            defaultValue: "transparent",
            section: "style",
            propertyHelp: {
                tooltip: "Background color of the dashed drop-placeholder.",
            },
            /* wwEditor:start */
            bindingValidation: {
                type: "string",
                tooltip: "A CSS color for the drop preview background",
            },
            /* wwEditor:end */
        },
    },
};
