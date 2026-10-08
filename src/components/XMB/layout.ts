// Shared XMB geometry, so the category bar, sub-items and info panel line up.

export const ICON_SIZE_VH = 14;      // category + item icon size
export const ACTIVE_ANCHOR_X = 250;  // px — centre of the active category column
export const ROW_TOP_VH = 40;        // category row's vertical centre
export const ITEM_GAP_VH = 10;       // gap between category row and active item

// Vertical centre of the active item row
export const ACTIVE_ROW_CENTER_VH = ROW_TOP_VH + ITEM_GAP_VH + ICON_SIZE_VH / 2;

// When an item is opened, the menu slides left so the active column sits at the
// screen edge (as on the PSP), leaving room for the side panel
export const EXPANDED_MARGIN_PX = 32;
export const expandedShift = (iconPx: number) => ACTIVE_ANCHOR_X - (iconPx / 2 + EXPANDED_MARGIN_PX);
