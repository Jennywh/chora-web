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
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function ManageChores({
  chores,
  groupMembers,
  onAddChore,
  onEditChore,
  onDeleteChore,
  currentUser,
}) {
  const [choreTitle, setChoreTitle] = useState('');
  const [choreFrequency, setChoreFrequency] = useState(1);
  const [choreStartDate, setChoreStartDate] = useState(
    dayjs().format('YYYY-MM-DD')
  );
  const [assignedUid, setAssignedUid] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingChoreId, setEditingChoreId] = useState(null);

  const handleAddChoreClick = () => {
    if (!choreTitle.trim()) return;

    if (editMode) {
      onEditChore({
        id: editingChoreId,
        title: choreTitle,
        frequency: Number(choreFrequency),
        startDate: choreStartDate,
        assignedTo: assignedUid || currentUser.uid,
      });
      setEditMode(false);
      setEditingChoreId(null);
    } else {
      onAddChore({
        title: choreTitle,
        frequency: Number(choreFrequency),
        startDate: choreStartDate,
        assignedTo: assignedUid || currentUser.uid,
      });
    }

    // Reset form
    setChoreTitle('');
    setChoreFrequency(1);
    setChoreStartDate(dayjs().format('YYYY-MM-DD'));
    setAssignedUid('');
  };

  const handleEditClick = (chore) => {
    setChoreTitle(chore.title);
    setChoreFrequency(chore.frequency);
    setChoreStartDate(chore.startDate);
    setAssignedUid(chore.assignedTo);
    setEditMode(true);
    setEditingChoreId(chore.id);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Manage Chores
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Chore Title"
          value={choreTitle}
          onChange={(e) => setChoreTitle(e.target.value)}
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Assign To</InputLabel>
          <Select
            label="Assign To"
            value={assignedUid}
            onChange={(e) => setAssignedUid(e.target.value)}
          >
            <MenuItem value="">
              <em>Assign to yourself</em>
            </MenuItem>
            {groupMembers.map((m) => (
              <MenuItem key={m.uid} value={m.uid}>
                {m.username || m.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Frequency (Days)"
          type="number"
          value={choreFrequency}
          onChange={(e) => setChoreFrequency(e.target.value)}
          size="small"
          sx={{ width: 120 }}
        />

        <TextField
          label="Start Date"
          type="date"
          value={choreStartDate}
          onChange={(e) => setChoreStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 150 }}
        />

        <Button
          variant="contained"
          color={editMode ? 'primary' : 'success'}
          onClick={handleAddChoreClick}
        >
          {editMode ? 'Save Changes' : 'Add'}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Repeats Every (Days)</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chores.map((chore) => {
              const assignedUser = groupMembers.find(
                (m) => m.uid === chore.assignedTo
              );
              return (
                <TableRow key={chore.id}>
                  <TableCell>{chore.title}</TableCell>
                  <TableCell>
                    {assignedUser
                      ? assignedUser.username || assignedUser.email
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>{chore.frequency}</TableCell>
                  <TableCell>{chore.startDate}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(chore)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => onDeleteChore(chore.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
