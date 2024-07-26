import React from 'react';
import { useDrag } from 'react-dnd';

const ChartIcon = ({ type, icon, label }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'CHART',
        item: { type, label },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                padding: '8px',
                border: '1px solid #ccc',
                marginBottom: '4px',
                cursor: 'move',
                display: 'inline-block',
                marginRight: '8px',
            }}
        >
            {icon}
            <div>{label}</div>
        </div>
    );
};

export default ChartIcon;
