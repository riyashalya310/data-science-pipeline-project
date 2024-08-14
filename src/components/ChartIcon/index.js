import React from 'react';
import { useDrag } from 'react-dnd';

const ChartIcon = ({ type, icon, label }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CHART',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '10px',
        border: '1px solid #ddd',
        marginBottom: '10px',
        cursor: 'move',
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default ChartIcon;
