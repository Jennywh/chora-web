import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export default function WeeklyReport({ chores, dailyCompletions, groupMembers }) {
  const calculateCompletionRate = (choreId) => {
    const completions = dailyCompletions.filter(dc => dc.choreId === choreId && dc.completed);
    return (completions.length / 7) * 100;
  };

  const userCompletionComparison = groupMembers.map(member => {
    const userCompletions = dailyCompletions.filter(dc => dc.completed && dc.userId === member.uid);
    return {
      username: member.username || member.email,
      completed: userCompletions.length,
    };
  });

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: 2 }}>
        Weekly Report
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Total Chores: {chores.length}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Completed Chores: {dailyCompletions.filter(dc => dc.completed).length}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Completion Rate: {((dailyCompletions.filter(dc => dc.completed).length / (chores.length * 7)) * 100).toFixed(2)}%
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, marginTop: 3 }}>
        User Comparison
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Completed Chores</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userCompletionComparison.map(user => (
            <TableRow key={user.username}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.completed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}