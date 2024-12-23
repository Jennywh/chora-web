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
} from '@mui/material';

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
}) {
  const today = dayjs();
  const todayString = today.format('YYYY-MM-DD');

  const choresDueToday = chores.filter((c) => isChoreDue(c, today));
  const filteredChores = choresDueToday.filter(
    (chore) =>
      selectedMembers.length === 0 || selectedMembers.includes(chore.assignedTo)
  );

  return (
    <div>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
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
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
