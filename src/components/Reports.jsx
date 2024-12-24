import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

const Reports = ({ chores, dailyCompletions, groupMembers }) => {
  const totalChores = chores.length;
  const completedChores = dailyCompletions.filter((dc) => dc.completed).length;
  const completionRate = ((completedChores / (totalChores * 7)) * 100).toFixed(
    2
  );

  const userCompletionComparison = groupMembers.map((member) => {
    const userCompletions = dailyCompletions.filter(
      (dc) => dc.completed && dc.userId === member.uid
    );
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
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Chores</Typography>
              <Typography variant="h4">{totalChores}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Completed Chores</Typography>
              <Typography variant="h4">{completedChores}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Completion Rate</Typography>
              <Typography variant="h4">{completionRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h6" sx={{ fontWeight: 600, marginTop: 3 }}>
        User Comparison
      </Typography>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Completed Chores</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userCompletionComparison.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.completed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
