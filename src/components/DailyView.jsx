// src/components/DailyView.js
import React from 'react';
import dayjs from 'dayjs';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  Box,
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
}) {
  const today = dayjs();
  const todayString = today.format('YYYY-MM-DD');

  const choresDueToday = chores.filter((c) => isChoreDue(c, today));

  return (
    <div>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Today's Chores ({todayString})
      </Typography>

      {choresDueToday.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No chores due today.
        </Typography>
      ) : (
        choresDueToday.map((chore) => {
          const docId = `${chore.id}_${todayString}`;
          const dailyRecord = dailyCompletions.find((d) => d.docId === docId);
          const isDone = dailyRecord?.completed || false;
          const assignedUser = groupMembers.find(
            (m) => m.uid === chore.assignedTo
          );

          return (
            <Card key={chore.id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">{chore.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignedUser ? assignedUser.email : 'Unknown'}
                </Typography>
              </CardContent>
              <CardActions>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Typography variant="body2">Mark Complete</Typography>
                </Box>
              </CardActions>
            </Card>
          );
        })
      )}
    </div>
  );
}
