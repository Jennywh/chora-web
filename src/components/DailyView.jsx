import React from 'react';
import dayjs from 'dayjs';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Box,
} from '@mui/material';
import { formatDate } from '../utils/dateUtils'; // Import the utility function

function isChoreDue(chore, dateObj) {
  const start = dayjs(chore.startDate, 'YYYY-MM-DD');
  const diff = dateObj.diff(start, 'day');
  return diff >= 0 && diff % chore.frequency === 0;
}

export default function DailyView({
  chores,
  groupMembers,
  dailyCompletions,
  onToggleDailyCompletion,
  selectedMembers,
  currentUser, // Add currentUser prop
}) {
  const today = dayjs();
  const todayString = formatDate(today); // Use the utility function

  const choresDueToday = chores.filter((c) => isChoreDue(c, today));
  const filteredChores = choresDueToday
    .filter(
      (chore) =>
        selectedMembers.length === 0 || selectedMembers.includes(chore.assignedTo)
    )
    .sort((a, b) => dayjs(b.addedTime).diff(dayjs(a.addedTime))); // Sort by addedTime

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Today's Chores ({todayString})
      </Typography>

      {filteredChores.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No chores due today.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Done?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChores.map((chore) => {
                const docId = `${chore.id}_${todayString}`;
                const dailyRecord = dailyCompletions.find(
                  (d) => d.docId === docId
                );
                const isDone = dailyRecord?.completed || false;
                const assignedUser = groupMembers.find(
                  (m) => m.uid === chore.assignedTo
                );
                const userColor = assignedUser ? assignedUser.color : 'inherit';
                const isAssignedUser = assignedUser && assignedUser.uid === currentUser.uid;

                return (
                  <TableRow key={chore.id} sx={{ backgroundColor: userColor }}>
                    <TableCell>{chore.title}</TableCell>
                    <TableCell>
                      {assignedUser
                        ? assignedUser.username || assignedUser.email
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={isDone}
                        onChange={(e) =>
                          onToggleDailyCompletion(
                            chore.id,
                            todayString,
                            e.target.checked
                          )
                        }
                        disabled={!isAssignedUser} // Disable if not assigned user
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
