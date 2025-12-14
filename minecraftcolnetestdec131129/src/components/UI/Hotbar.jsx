import { useMemo, useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import { BLOCK_TYPES, BLOCK_PROPERTIES } from '../../utils/constants';

// Generate a mini texture preview for a block
function generateBlockPreview(blockType) {
  const props = BLOCK_PROPERTIES[blockType];
  if (!props) return null;

  const topColor = props.topColor || props.color || '#888888';
  const sideColor = props.sideColor || props.color || '#666666';
  const baseColor = props.color || '#555555';

  return {
    top: topColor,
    side: sideColor,
    front: sideColor,
    base: baseColor
  };
}

// Individual hotbar slot with 3D block preview
function HotbarSlot({ index, item, isSelected }) {
  const selectSlot = useGameStore(state => state.selectSlot);

  const blockProps = item ? BLOCK_PROPERTIES[item.type] : null;
  const colors = item ? generateBlockPreview(item.type) : null;

  return (
    <div
      className={`hotbar-slot ${isSelected ? 'selected' : ''}`}
      onClick={() => selectSlot(index)}
    >
      {item && colors && (
        <>
          <div className="slot-block-3d">
            {/* Top face */}
            <div
              className="block-face top"
              style={{ backgroundColor: colors.top }}
            />
            {/* Front face */}
            <div
              className="block-face front"
              style={{ backgroundColor: colors.front }}
            />
            {/* Side face */}
            <div
              className="block-face side"
              style={{ backgroundColor: colors.side }}
            />
          </div>
          {item.count > 1 && (
            <span className="slot-count">{item.count}</span>
          )}
        </>
      )}
      <span className="slot-number">{index + 1}</span>
    </div>
  );
}

// Main hotbar component
export function Hotbar() {
  const inventory = useGameStore(state => state.inventory);
  const selectedSlot = useGameStore(state => state.player.selectedSlot);
  const isPlaying = useGameStore(state => state.isPlaying);

  // Get hotbar items (first 9 slots)
  const hotbarItems = useMemo(() => {
    return inventory.slice(0, 9);
  }, [inventory]);

  // Get selected item name
  const selectedItem = hotbarItems[selectedSlot];
  const selectedName = selectedItem
    ? BLOCK_PROPERTIES[selectedItem.type]?.name || 'Unknown'
    : null;

  if (!isPlaying) return null;

  return (
    <div className="hotbar-container">
      {selectedName && (
        <div className="selected-item-name">
          {selectedName}
        </div>
      )}
      <div className="hotbar">
        {hotbarItems.map((item, index) => (
          <HotbarSlot
            key={index}
            index={index}
            item={item}
            isSelected={index === selectedSlot}
          />
        ))}
      </div>
    </div>
  );
}

export default Hotbar;
