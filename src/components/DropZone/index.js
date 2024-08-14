import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ onDrop, onDropColumn, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['CHART', 'COLUMN'],
    drop: (item, monitor) => {
      if (monitor.getItemType() === 'CHART') {
        onDrop(item);
      } else if (monitor.getItemType() === 'COLUMN') {
        onDropColumn(item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        minHeight: '400px',
        border: '2px dashed #ccc',
        padding: '16px',
        backgroundColor: isOver ? '#f0f0f0' : '#fff',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default DropZone;
