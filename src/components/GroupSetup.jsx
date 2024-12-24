import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button
} from '@mui/material';

export default function GroupSetup({
  onJoinGroup,
  onCreateGroup,
  groupIdInput,
  setGroupIdInput,
  groupName,
  setGroupName
}) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Join Group" />
        <Tab label="Create Group" />
      </Tabs>

      {/* Join Group Form */}
      {activeTab === 0 && (
        <Box sx={{ pt: 2 }}>
          <Typography variant="h5" gutterBottom>
            Join an Existing Group
          </Typography>
          <TextField
            label="Enter Group ID"
            variant="outlined"
            size="small"
            value={groupIdInput}
            onChange={(e) => setGroupIdInput(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button variant="contained" onClick={onJoinGroup}>
            Join Group
          </Button>
        </Box>
      )}

      {/* Create Group Form */}
      {activeTab === 1 && (
        <Box sx={{ pt: 2 }}>
          <Typography variant="h5" gutterBottom>
            Create a New Group
          </Typography>
          <TextField
            label="New Group Name"
            variant="outlined"
            size="small"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button variant="contained" onClick={onCreateGroup}>
            Create Group
          </Button>
        </Box>
      )}
    </Box>
  );
}
