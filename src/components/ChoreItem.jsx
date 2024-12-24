// src/components/ChoreItem.js
import React from "react";

/**
 * Props:
 *  - chore: { id, title, frequency, startDate, completed, assignedTo }
 *  - assignedUser: { email } (or undefined)
 *  - onToggleComplete: (choreId: string, completed: boolean) => void
 */
export default function ChoreItem({ chore, assignedUser, onToggleComplete }) {
  const handleCheckboxChange = (e) => {
    onToggleComplete(chore.id, e.target.checked);
  };

  return (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      <td style={{ padding: "0.5rem" }}>
        <input
          type="checkbox"
          checked={!!chore.completed}
          onChange={handleCheckboxChange}
        />
      </td>
      <td style={{ padding: "0.5rem" }}>{chore.title}</td>
      <td style={{ padding: "0.5rem" }}>
        {assignedUser ? assignedUser.email : "Unknown"}
      </td>
      <td style={{ padding: "0.5rem" }}>{chore.frequency}</td>
      <td style={{ padding: "0.5rem" }}>{chore.startDate}</td>
    </tr>
  );
}
