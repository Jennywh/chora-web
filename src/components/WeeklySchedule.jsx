// src/components/WeeklySchedule.js
import React from 'react';
import dayjs from 'dayjs';
import {
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';

function isChoreDue(chore, dateObj) {
  const start = dayjs(chore.startDate, 'YYYY-MM-DD');
  const diff = dateObj.diff(start, 'day');
  return diff >= 0 && diff % chore.frequency === 0;
}

export default function WeeklySchedule({ chores, groupMembers, selectedMembers }) {
  const filteredChores = chores.filter((chore) =>
    selectedMembers.length === 0 || selectedMembers.includes(chore.assignedTo)
  );

  return (
    <div>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Weekly Schedule
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Chores</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const dayObj = dayjs().add(offset, 'day');
              const dayString = dayObj.format('YYYY-MM-DD');
              const choresForDay = filteredChores.filter((c) => isChoreDue(c, dayObj));

              return (
                <TableRow key={offset}>
                  <TableCell>
                    {offset === 0 ? 'Today' : dayObj.format('ddd')}
                  </TableCell>
                  <TableCell>{dayString}</TableCell>
                  <TableCell>
                    {choresForDay.length === 0 ? (
                      <em>No chores due</em>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        {choresForDay.map((c) => {
                          const assignedUser = groupMembers.find(
                            (m) => m.uid === c.assignedTo
                          );
                          const userColor = assignedUser ? assignedUser.color : 'inherit';
                          return (
                            <li key={c.id} style={{ color: userColor }}>
                              {c.title} {'('}
                              {assignedUser
                                ? assignedUser.username || assignedUser.email
                                : 'Unknown'}
                              {')'}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
