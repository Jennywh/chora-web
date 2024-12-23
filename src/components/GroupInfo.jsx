import React from 'react';
import { Typography, Box } from '@mui/material';

export default function GroupInfo({ group }) {
  if (!group) return null;

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="h6" component="span">
        {group.name}
      </Typography>
      <Typography variant="body1" component="span">
        (#{group.id})
      </Typography>
    </Box>
  );
}
