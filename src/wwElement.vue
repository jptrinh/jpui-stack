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
        drag-class="ww-stack-dragged"
        :force-fallback="true"
        :fallback-tolerance="3"
        :animation="animation"
        :delay="touchDragDelay"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        :class="['draggable-container', `layout-${layout}`, `direction-${direction}`, { 'is-draggable': !isEditing && !isReadonly }]"
        :style="{ ...containerStyle, ...previewCssVars, ...draggedCssVars }"
        @change="onChange"
        @start="onStart"
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
    mounted() {
        this.hideDragInternals();
    },
    methods: {
        // SortableJS (el["Sortable<timestamp>"]) and vuedraggable (el.__draggable_component__) keep their
        // instances on the root element. WeWeb's workflow logger walks the enumerable own properties of that
        // element (context.thisInstance) down into Vue's reactivity graph and overflows the stack: "Maximum
        // call stack size exceeded" in any workflow started by an item event. Non-enumerable, both libraries
        // still read them, the logger no longer sees them.
        hideDragInternals() {
            const el = this.$el;
            if (!el) return;
            for (const key of Object.keys(el)) {
                if (key !== "__draggable_component__" && !key.startsWith("Sortable")) continue;
                const value = el[key];
                Object.defineProperty(el, key, { value, enumerable: false, writable: true, configurable: true });
            }
        },
        onStart() {
            this.setDrag(true);
            // Android browsers only: iOS Safari has no Vibration API
            if (this.hapticFeedback) navigator.vibrate?.(10);
        },
        onChange(change) {
            this.customHandler &&
                this.customHandler(change, { ...this.wwElementState?.props, updatedStackItems: this.internalItems });
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
            return this.wwEditorState?.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        items() {
            const data = this.wwElementState?.props?.items ? this.wwElementState?.props?.items : this.content?.items;
            const items = wwLib.wwCollection.getCollectionData(data);
            if (!Array.isArray(items)) return [];
            return items;
        },
        group() {
            return this.wwElementState?.props?.group ? this.wwElementState?.props?.group : this.content?.group;
        },
        sortable() {
            // Always a boolean (vuedraggable reads undefined as true), and a wwProps `false` must win over content
            const fromProps = this.wwElementState?.props?.sortable;
            return typeof fromProps === "boolean" ? fromProps : this.content?.sortable !== false;
        },
        itemKey() {
            return this.wwElementState?.props?.itemKey || "id";
        },
        handle() {
            return this.wwElementState?.props?.handle?.length
                ? this.wwElementState?.props?.handle
                : this.content?.customDragHandle
                ? this.content?.handleClass || "draggable"
                : null;
        },
        isReadonly() {
            /* wwEditor:start */
            if (this.wwEditorState?.isSelected) {
                return !!this.wwElementState?.states?.includes("readonly");
            }
            /* wwEditor:end */
            // Ensure to return a boolean as vuedraggable interpret undefined as true
            return !!(this.wwElementState?.props?.readonly || this.content?.readonly);
        },
        direction() {
            return this.wwElementState?.props?.direction || this.content?.direction || "vertical";
        },
        layout() {
            const value = this.wwElementState?.props?.layout || this.content?.layout;
            return value === "grid" ? "grid" : "flex";
        },
        // Legacy single gap (number of px), the fallback for Row gap / Column gap
        gap() {
            const value = this.wwElementState?.props?.gap ?? this.content?.gap ?? 0;
            return `${value}px`;
        },
        rowGap() {
            return this.wwElementState?.props?.rowGap || this.content?.rowGap || this.gap;
        },
        columnGap() {
            return this.wwElementState?.props?.columnGap || this.content?.columnGap || this.gap;
        },
        wrap() {
            return this.wwElementState?.props?.wrap ?? this.content?.wrap ?? false;
        },
        gridTemplateColumns() {
            return (
                this.wwElementState?.props?.gridTemplateColumns ||
                this.content?.gridTemplateColumns ||
                "repeat(auto-fill, minmax(128px, 1fr))"
            );
        },
        animation() {
            const value = Number(this.wwElementState?.props?.animation ?? this.content?.animation ?? 150);
            return Number.isFinite(value) && value > 0 ? value : 0;
        },
        // Touch only: a finger that moves before the delay scrolls the page instead of dragging (mouse drags at once).
        // "Moves" = past touch-start-threshold, which SortableJS forces to 1 px unless force-fallback is on.
        touchDragDelay() {
            const value = Number(this.wwElementState?.props?.touchDragDelay ?? this.content?.touchDragDelay ?? 200);
            return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1000) : 200;
        },
        hapticFeedback() {
            return (this.wwElementState?.props?.hapticFeedback ?? this.content?.hapticFeedback) !== false;
        },
        containerStyle() {
            const gaps = { rowGap: this.rowGap, columnGap: this.columnGap };
            if (this.layout === "grid") return { ...gaps, gridTemplateColumns: this.gridTemplateColumns };
            return { ...gaps, flexWrap: this.wrap ? "wrap" : "nowrap" };
        },
        previewCssVars() {
            const p = this.wwElementState?.props ?? {};
            const c = this.content ?? {};
            return {
                "--ww-stack-preview-border": p.previewBorder ?? c.previewBorder ?? "2px dashed #9CA3AF",
                "--ww-stack-preview-border-radius": p.previewBorderRadius ?? c.previewBorderRadius ?? "0px",
                "--ww-stack-preview-background": p.previewBackground ?? c.previewBackground ?? "transparent",
            };
        },
        draggedCssVars() {
            const p = this.wwElementState?.props ?? {};
            const c = this.content ?? {};
            const opacity = Number(p.draggedOpacity ?? c.draggedOpacity ?? 0.8);
            return {
                "--ww-stack-dragged-transform": p.draggedTransform || c.draggedTransform || "none",
                "--ww-stack-dragged-opacity": Number.isFinite(opacity) ? Math.min(Math.max(opacity, 0), 1) : 0.8,
                "--ww-stack-dragged-border": p.draggedBorder || c.draggedBorder || "none",
                "--ww-stack-dragged-duration": `${this.animation}ms`,
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
                this.customDragHandler(value, { ...this.wwElementState?.props });
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
/** DRAGGED ITEM: the copy that follows the pointer (SortableJS fallback, forced so the mouse gets it too: the
    browser's native drag image is a snapshot CSS can't style). SortableJS moves the copy with an inline
    translate3d and sets its opacity inline, so the transform goes on its child, and grows from the grab point. */
.draggable-container :deep(.ww-stack-dragged) {
    opacity: var(--ww-stack-dragged-opacity, 0.8) !important;
}
.draggable-container :deep(.ww-stack-dragged) > * {
    transform: var(--ww-stack-dragged-transform, none);
    transform-origin: inherit;
    animation: ww-stack-lift var(--ww-stack-dragged-duration, 150ms) ease-out;
}
/* The border is an overlay inside the item's edges, on the item itself (child of wwLayout's .ww-layout wrapper) so it
   inherits the item's corner radius. No position override: a static item falls back to the wrapper, which is relative. */
.draggable-container :deep(.ww-stack-dragged) > .ww-layout > *::after {
    content: "";
    position: absolute;
    inset: 0;
    border: var(--ww-stack-dragged-border, none);
    border-radius: inherit;
    pointer-events: none;
    /* Over the item's own positioned children; the copy is its own stacking context, so it can't go higher */
    z-index: 2147483647;
}
@keyframes ww-stack-lift {
    from {
        transform: none;
    }
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
/* Pressing an item must not select text: the drag starts after a few px (mouse) or a delay (touch), and native
   drag used to block selection on its own */
.is-draggable > .draggable-item {
    -webkit-user-select: none;
    user-select: none;
}
/* A long press must not open the iOS image / link callout */
@media (pointer: coarse) {
    .is-draggable > .draggable-item {
        -webkit-touch-callout: none;
    }
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
