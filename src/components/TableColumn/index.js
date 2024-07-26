import React from "react";
import { useDrag } from "react-dnd";

const TableColumn = ({ columnName }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COLUMN",
    item: { columnName },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <th ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}>
      {" "}
      {columnName}{" "}
    </th>
  );
};

export default TableColumn;
