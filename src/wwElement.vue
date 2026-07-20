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
        :class="['draggable-container', `direction-${direction}`]"
        :style="{ gap: gap, flexWrap: wrap ? 'wrap' : 'nowrap', ...previewCssVars }"
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
        gap() {
            const value = this.wwElementState.props.gap ?? this.content.gap ?? 0;
            return `${value}px`;
        },
        wrap() {
            return this.wwElementState.props.wrap ?? this.content.wrap ?? false;
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
.draggable-container {
    display: flex !important;
}
.direction-vertical {
    flex-direction: column;
}
.direction-horizontal {
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
