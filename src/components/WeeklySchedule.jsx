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
  IconButton,
} from '@mui/material';
import { formatDate } from '../utils/dateUtils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

  const startOfWeek = dayjs().startOf('week').add(weekOffset, 'week');
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

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          marginBottom: 3,
          borderBottom: '2px solid #ddd',
          paddingBottom: 1,
        }}
      >
        Weekly Schedule
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <IconButton
          onClick={handlePrevWeek}
          disabled={!hasDataForPreviousWeek}
          sx={{ color: hasDataForPreviousWeek ? 'primary.main' : 'grey.400' }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Typography variant="h6">
          {startOfWeek.format('MMMM D')} -{' '}
          {startOfWeek.add(6, 'day').format('MMMM D, YYYY')}
        </Typography>

        <IconButton onClick={handleNextWeek} sx={{ color: 'primary.main' }}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f4f6f8',
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>Chore</TableCell>
              {daysOfWeek.map((dayObj, index) => (
                <TableCell key={index} sx={{ fontWeight: 600 }}>
                  {dayObj.format('ddd')}
                  <br />
                  {formatDate(dayObj)}
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
    </Box>
  );
}
