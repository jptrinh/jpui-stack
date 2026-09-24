<template>
    <draggable
        v-model="internalItems"
        :item-key="itemKey"
        :clone="(el) => el"
        :group="group"
        :sort="sortable"
        :handle="handle?.length ? `.${handle}` : null"
        :disabled="isEditing || isReadonly"
        ghost-class="ww-stack-drag-preview"
        :animation="animation"
        :class="['draggable-container', `layout-${layout}`, `direction-${direction}`]"
        :style="{ ...containerStyle, ...previewCssVars }"
        @change="onChange"
        @start="setDrag(true)"
        @end="setDrag(false)"
    >
        <template v-if="content?.showHeader" #header>
            <wwLayout path="headerContent" />
        </template>
        <template #item="{ element, index: itemIndex }">
            <div class="draggable-item">
                <wwLayoutItemContext
                    :index="itemIndex"
                    :item="null"
                    is-repeat
                    :data="element"
                    :repeated-items="internalItems"
                >
                    <wwLayout path="itemElement"></wwLayout>
                </wwLayoutItemContext>
            </div>
        </template>
        <template v-if="content?.showFooter" #footer>
            <wwLayout path="footerContent" />
        </template>
    </draggable>
</template>

<script>
import draggable from "vuedraggable";

export default {
    components: {
        draggable,
    },
    inject: {
        customHandler: { defaultValue: null },
        customDragHandler: { defaultValue: null },
    },
    props: {
        wwElementState: { type: Object, required: true },
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ["trigger-event"],
    setup(props) {
        const { value: isDragging, setValue: setDrag } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: "isDragging",
            type: "boolean",
            defaultValue: false,
            readonly: true,
        });
        return { isDragging, setDrag };
    },
    data: () => ({
        internalItems: [],
    }),
    methods: {
        onChange(change) {
            this.customHandler &&
                this.customHandler(change, { ...this.wwElementState.props, updatedStackItems: this.internalItems });
            if (change.moved) {
                this.$emit("trigger-event", {
                    name: "item:moved",
                    event: {
                        item: change.moved.element,
                        oldIndex: change.moved.oldIndex,
                        newIndex: change.moved.newIndex,
                        updatedList: this.internalItems,
                    },
                });
            }

            if (change.added) {
                this.$emit("trigger-event", {
                    name: "item:added",
                    event: {
                        item: change.added.element,
                        newIndex: change.added.newIndex,
                        updatedList: this.internalItems,
                    },
                });
            }

            if (change.removed) {
                this.$emit("trigger-event", {
                    name: "item:removed",
                    event: {
                        item: change.removed.element,
                        oldIndex: change.removed.oldIndex,
                        updatedList: this.internalItems,
                    },
                });
            }
        },
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        items() {
            const data = this.wwElementState.props.items ? this.wwElementState.props.items : this.content.items;
            const items = wwLib.wwCollection.getCollectionData(data);
            if (!Array.isArray(items)) return [];
            return items;
        },
        group() {
            return this.wwElementState.props.group ? this.wwElementState.props.group : this.content.group;
        },
        sortable() {
            return this.wwElementState.props.sortable ? this.wwElementState.props.sortable : this.content.sortable;
        },
        itemKey() {
            return this.wwElementState.props.itemKey || "id";
        },
        handle() {
            return this.wwElementState.props.handle?.length
                ? this.wwElementState.props.handle
                : this.content.customDragHandle
                ? this.content.handleClass || "draggable"
                : null;
        },
        isReadonly() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes("readonly");
            }
            /* wwEditor:end */
            // Ensure to return a boolean as vuedraggable interpret undefined as true
            return !!(this.wwElementState.props.readonly || this.content.readonly);
        },
        direction() {
            return this.wwElementState.props.direction || this.content.direction || "vertical";
        },
        layout() {
            const value = this.wwElementState.props.layout || this.content?.layout;
            return value === "grid" ? "grid" : "flex";
        },
        // Legacy single gap (number of px), the fallback for Row gap / Column gap
        gap() {
            const value = this.wwElementState.props.gap ?? this.content?.gap ?? 0;
            return `${value}px`;
        },
        rowGap() {
            return this.wwElementState.props.rowGap || this.content?.rowGap || this.gap;
        },
        columnGap() {
            return this.wwElementState.props.columnGap || this.content?.columnGap || this.gap;
        },
        wrap() {
            return this.wwElementState.props.wrap ?? this.content?.wrap ?? false;
        },
        gridTemplateColumns() {
            return (
                this.wwElementState.props.gridTemplateColumns ||
                this.content?.gridTemplateColumns ||
                "repeat(auto-fill, minmax(128px, 1fr))"
            );
        },
        animation() {
            const value = Number(this.wwElementState.props.animation ?? this.content?.animation ?? 150);
            return Number.isFinite(value) && value > 0 ? value : 0;
        },
        containerStyle() {
            const gaps = { rowGap: this.rowGap, columnGap: this.columnGap };
            if (this.layout === "grid") return { ...gaps, gridTemplateColumns: this.gridTemplateColumns };
            return { ...gaps, flexWrap: this.wrap ? "wrap" : "nowrap" };
        },
        previewCssVars() {
            const p = this.wwElementState.props;
            const c = this.content;
            return {
                "--ww-stack-preview-border": p.previewBorder ?? c.previewBorder ?? "2px dashed #9CA3AF",
                "--ww-stack-preview-border-radius": p.previewBorderRadius ?? c.previewBorderRadius ?? "0px",
                "--ww-stack-preview-background": p.previewBackground ?? c.previewBackground ?? "transparent",
            };
        },
    },
    watch: {
        items: {
            immediate: true,
            deep: true,
            handler: function (value) {
                this.internalItems = [...value];
            },
        },
        isDragging(value) {
            if (this.customDragHandler) {
                this.customDragHandler(value, { ...this.wwElementState.props });
            }
        },
        isReadonly: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit("add-state", "readonly");
                } else {
                    this.$emit("remove-state", "readonly");
                }
            },
        },
    },
};
</script>

<style scoped>
.draggable-container.layout-flex {
    display: flex !important;
}
.layout-flex.direction-vertical {
    flex-direction: column;
}
.layout-flex.direction-horizontal {
    flex-direction: row;
}
/** DROP PREVIEW: render the ghost placeholder as a dashed outline that keeps
    the dragged item's dimensions (visibility:hidden preserves layout). */
.draggable-container :deep(.ww-stack-drag-preview) {
    opacity: 1 !important;
    background: var(--ww-stack-preview-background, transparent) !important;
    border: var(--ww-stack-preview-border, 2px dashed #9ca3af) !important;
    border-radius: var(--ww-stack-preview-border-radius, 0px) !important;
    box-sizing: border-box;
}
.draggable-container :deep(.ww-stack-drag-preview) > * {
    visibility: hidden !important;
}
.draggable-container.layout-grid {
    display: grid !important;
    /* Rows keep their own height even when the stack is taller than its content */
    align-content: start;
}
/* Header and footer span the whole row instead of taking one cell */
.layout-grid > :not(.draggable-item) {
    grid-column: 1 / -1;
}
/* Let 1fr columns shrink below their content (long file names would widen them) */
.layout-grid > .draggable-item {
    min-width: 0;
}
/** FIX POINTER-EVENTS: ALL BREAKING DRAGGABLE ON MOBILE/TABLET (TOUCH MODE) */
.draggable-item :deep(.ww-layout) {
    pointer-events: unset !important;
}
.draggable-item :deep(* > .ww-element) {
    pointer-events: unset !important;
}
.draggable-item :deep(* .ww-element) {
    pointer-events: unset !important;
}
</style>
