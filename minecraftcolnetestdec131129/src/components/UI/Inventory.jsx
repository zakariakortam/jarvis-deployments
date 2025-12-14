import { useState, useCallback } from 'react';
import useGameStore from '../../store/gameStore';
import { BLOCK_TYPES, BLOCK_PROPERTIES } from '../../utils/constants';

// Inventory slot component
function InventorySlot({ index, item, isSelected, onClick, onDragStart, onDragOver, onDrop }) {
  const blockProps = item ? BLOCK_PROPERTIES[item.type] : null;
  const bgColor = blockProps?.color || 'transparent';

  return (
    <div
      className={`inventory-slot ${isSelected ? 'selected' : ''} ${index < 9 ? 'hotbar-row' : ''}`}
      onClick={() => onClick(index)}
      draggable={!!item}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      {item && (
        <>
          <div
            className="slot-block"
            style={{ backgroundColor: bgColor }}
          >
            <div className="block-3d-effect" />
          </div>
          {item.count > 1 && (
            <span className="slot-count">{item.count}</span>
          )}
        </>
      )}
    </div>
  );
}

export function Inventory() {
  const showInventory = useGameStore(state => state.showInventory);
  const inventory = useGameStore(state => state.inventory);
  const setInventorySlot = useGameStore(state => state.setInventorySlot);
  const toggleInventory = useGameStore(state => state.toggleInventory);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [draggedSlot, setDraggedSlot] = useState(null);

  // Handle slot click
  const handleSlotClick = useCallback((index) => {
    if (selectedSlot === null) {
      // Pick up item
      if (inventory[index]) {
        setSelectedSlot(index);
      }
    } else if (selectedSlot === index) {
      // Deselect
      setSelectedSlot(null);
    } else {
      // Swap items
      const temp = inventory[selectedSlot];
      setInventorySlot(selectedSlot, inventory[index]);
      setInventorySlot(index, temp);
      setSelectedSlot(null);
    }
  }, [inventory, selectedSlot, setInventorySlot]);

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedSlot(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedSlot !== null && draggedSlot !== index) {
      const temp = inventory[draggedSlot];
      setInventorySlot(draggedSlot, inventory[index]);
      setInventorySlot(index, temp);
    }
    setDraggedSlot(null);
  };

  // Handle keyboard close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' || e.key === 'e') {
      toggleInventory();
    }
  }, [toggleInventory]);

  if (!showInventory) return null;

  return (
    <div className="inventory-overlay" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="inventory-container">
        <div className="inventory-header">
          <h2>Inventory</h2>
          <button className="close-btn" onClick={toggleInventory}>×</button>
        </div>

        {/* Main inventory grid */}
        <div className="inventory-grid">
          {inventory.slice(9).map((item, i) => (
            <InventorySlot
              key={i + 9}
              index={i + 9}
              item={item}
              isSelected={selectedSlot === i + 9}
              onClick={handleSlotClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Hotbar row */}
        <div className="inventory-hotbar">
          {inventory.slice(0, 9).map((item, i) => (
            <InventorySlot
              key={i}
              index={i}
              item={item}
              isSelected={selectedSlot === i}
              onClick={handleSlotClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Item info */}
        {selectedSlot !== null && inventory[selectedSlot] && (
          <div className="item-info">
            <span className="item-name">
              {BLOCK_PROPERTIES[inventory[selectedSlot].type]?.name || 'Unknown'}
            </span>
            <span className="item-count">
              x{inventory[selectedSlot].count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
