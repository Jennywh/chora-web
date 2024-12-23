import React from 'react';
import { Typography, Box } from '@mui/material';

export default function GroupInfo({ group }) {
  if (!group) return null;

  return (
    <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#e0f7fa', borderRadius: 1 }}>
      <Typography variant="h5" component="span">
        {group.name}
      </Typography>
      <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
        (#{group.id})
      </Typography>
    </Box>
  );
}
