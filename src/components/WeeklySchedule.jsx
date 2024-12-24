import React, { useState } from 'react';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Import CheckIcon

function isChoreDue(chore, dateObj) {
  const start = dayjs(chore.startDate, 'YYYY-MM-DD');
  const diff = dateObj.diff(start, 'day');
  return diff >= 0 && diff % chore.frequency === 0;
}

export default function WeeklySchedule({
  chores,
  groupMembers,
  selectedMembers,
  dailyCompletions,
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const filteredChores = chores
    .filter(
      (chore) =>
        selectedMembers.length === 0 ||
        selectedMembers.includes(chore.assignedTo)
    )
    .sort((a, b) => dayjs(b.addedTime).diff(dayjs(a.addedTime)));

  const startOfWeek = dayjs().startOf('week').add(weekOffset, 'week'); // Adjust start of week based on offset
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
    startOfWeek.add(offset, 'day')
  );

  const handlePrevWeek = () => setWeekOffset(weekOffset - 1);
  const handleNextWeek = () => setWeekOffset(weekOffset + 1);

  const hasDataForPreviousWeek = filteredChores.some((chore) => {
    const previousWeekStart = startOfWeek.subtract(1, 'week');
    return [0, 1, 2, 3, 4, 5, 6].some((offset) => {
      const dayObj = previousWeekStart.add(offset, 'day');
      return isChoreDue(chore, dayObj);
    });
  });

  const weeklyReport = groupMembers.reduce((report, member) => {
    report[member.uid] = 0;
    return report;
  }, {});

  filteredChores.forEach((chore) => {
    daysOfWeek.forEach((dayObj) => {
      const dateStr = formatDate(dayObj);
      const docId = `${chore.id}_${dateStr}`;
      const dailyRecord = dailyCompletions.find((d) => d.docId === docId);
      if (dailyRecord?.completed) {
        weeklyReport[chore.assignedTo] += 1;
      }
    });
  });

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Weekly Schedule
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 2,
        }}
      >
        {hasDataForPreviousWeek ? (
          <button onClick={handlePrevWeek}>Previous Week</button>
        ) : (
          <span></span>
        )}
        <button onClick={handleNextWeek}>Next Week</button>
      </Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chore</TableCell>
              {daysOfWeek.map((dayObj, index) => (
                <TableCell key={index}>
                  {dayObj.format('ddd')}
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
                  const dateStr = formatDate(dayObj);
                  const docId = `${chore.id}_${dateStr}`;
                  const dailyRecord = dailyCompletions.find(
                    (d) => d.docId === docId
                  );
                  const isDone = dailyRecord?.completed || false;

                  return (
                    <TableCell
                      key={index}
                      sx={{ color: isDue ? assignedUser?.color : 'inherit' }}
                    >
                      {isDue ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {userName}
                          {isDone && (
                            <CheckCircleIcon
                              sx={{ ml: 1, fontSize: '1rem', color: 'green' }}
                            />
                          )}
                        </Box>
                      ) : (
                        ''
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ marginTop: 2 }}>
        <Typography variant="h6">Weekly Report</Typography>
        <ul>
          {groupMembers.map((member) => (
            <li key={member.uid}>
              {member.username || member.email}: {weeklyReport[member.uid]}
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
}
