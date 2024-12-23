import React from 'react';
import { Typography, Box, List, ListItem } from '@mui/material';

export default function GroupInfo({ group, members }) {
  if (!group) return null;

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="h6" component="span">
        {group.name}
      </Typography>
      <Typography variant="body1" component="span">
        (#{group.id})
      </Typography>

      <Typography variant="subtitle1" sx={{ marginTop: 1 }}>
        Members
      </Typography>
      {members.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No members yet.
        </Typography>
      ) : (
        <List>
          {members.map((m) => (
            <ListItem key={m.uid} dense divider>
              {m.username || m.email}{' '}
              {/* Show username if available, otherwise fallback to email */}
              {m.uid === group.owner && ' (Owner)'}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
