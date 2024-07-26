import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ onDrop, children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'CHART',
        drop: (item) => onDrop(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            style={{
                minHeight: '400px',
                border: '2px dashed #ccc',
                padding: '16px',
                backgroundColor: isOver ? '#f0f0f0' : '#fff',
            }}
        >
            {children}
        </div>
    );
};

export default DropZone;
