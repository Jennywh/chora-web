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
  Box,
} from '@mui/material';
import { formatDate } from '../utils/dateUtils'; // Import the utility function

function isChoreDue(chore, dateObj) {
  const start = dayjs(chore.startDate, 'YYYY-MM-DD');
  const diff = dateObj.diff(start, 'day');
  return diff >= 0 && diff % chore.frequency === 0;
}

export default function WeeklySchedule({
  chores,
  groupMembers,
  selectedMembers,
}) {
  const filteredChores = chores
    .filter(
      (chore) =>
        selectedMembers.length === 0 ||
        selectedMembers.includes(chore.assignedTo)
    )
    .sort((a, b) => dayjs(b.addedTime).diff(dayjs(a.addedTime)));

  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
    dayjs().add(offset, 'day')
  );

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Weekly Schedule
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chore</TableCell>
              {daysOfWeek.map((dayObj, index) => (
                <TableCell key={index}>
                  {index === 0 ? 'Today' : dayObj.format('ddd')}
                  <br />
                  {formatDate(dayObj)} {/* Use the utility function */}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChores.map((chore) => (
              <TableRow key={chore.id}>
                <TableCell>{chore.title}</TableCell>
                {daysOfWeek.map((dayObj, index) => {
                  const isDue = isChoreDue(chore, dayObj);
                  const assignedUser = groupMembers.find(
                    (m) => m.uid === chore.assignedTo
                  );
                  const userName = assignedUser
                    ? assignedUser.username || assignedUser.email
                    : 'Unknown';
                  return (
                    <TableCell
                      key={index}
                      sx={{ color: isDue ? assignedUser?.color : 'inherit' }}
                    >
                      {isDue ? userName : ''}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
