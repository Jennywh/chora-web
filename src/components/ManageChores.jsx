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
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils'; // Import the utility function

export default function ManageChores({
  chores,
  groupMembers,
  onAddChore,
  onEditChore,
  onDeleteChore,
  currentUser,
  currentUserName,
  selectedMembers,
}) {
  const [choreTitle, setChoreTitle] = useState('');
  const [choreFrequency, setChoreFrequency] = useState(1);
  const [choreStartDate, setChoreStartDate] = useState(
    dayjs().format('YYYY-MM-DD')
  );
  const [assignedUid, setAssignedUid] = useState('');
  const [editingChoreId, setEditingChoreId] = useState(null);
  const [editedChore, setEditedChore] = useState({});

  const handleAddChoreClick = () => {
    if (!choreTitle.trim()) return;

    onAddChore({
      title: choreTitle,
      frequency: Number(choreFrequency),
      startDate: choreStartDate,
      assignedTo: assignedUid || currentUser.uid,
    });

    // Reset form
    setChoreTitle('');
    setChoreFrequency(1);
    setChoreStartDate(dayjs().format('YYYY-MM-DD'));
    setAssignedUid('');
  };

  const handleEditClick = (chore) => {
    setEditingChoreId(chore.id);
    setEditedChore({ ...chore });
  };

  const handleCancelEdit = () => {
    setEditingChoreId(null);
    setEditedChore({});
  };

  const handleSaveClick = () => {
    onEditChore(editedChore);
    setEditingChoreId(null);
    setEditedChore({});
  };

  const handleChange = (field, value) => {
    setEditedChore((prev) => ({ ...prev, [field]: value }));
  };

  const filteredChores = chores
    .filter(
      (chore) =>
        selectedMembers.length === 0 ||
        selectedMembers.includes(chore.assignedTo)
    )
    .sort((a, b) => new Date(b.addedTime) - new Date(a.addedTime)); // Sort by addedTime in descending order

  return (
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Manage Chores
      </Typography>

      {/* Add Chore Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          marginBottom: 2,
        }}
      >
        <TextField
          label="New Chore"
          value={choreTitle}
          onChange={(e) => setChoreTitle(e.target.value)}
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Assign To</InputLabel>
          <Select
            label="Assign To"
            value={assignedUid || currentUser.uid}
            onChange={(e) => setAssignedUid(e.target.value)}
          >
            <MenuItem value={currentUser.uid}>
              {currentUserName || currentUser.email} (myself)
            </MenuItem>
            {groupMembers
              .filter((m) => m.uid !== currentUser.uid)
              .map((m) => (
                <MenuItem key={m.uid} value={m.uid}>
                  {m.username || m.email}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          label="Repeats Every (Days)"
          type="number"
          value={choreFrequency}
          onChange={(e) => setChoreFrequency(e.target.value)}
          size="small"
          sx={{ width: 180 }}
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
          color="success"
          onClick={handleAddChoreClick}
        >
          Add
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
            {filteredChores.map((chore) => {
              const assignedUser = groupMembers.find(
                (m) => m.uid === chore.assignedTo
              );
              const userColor = assignedUser ? assignedUser.color : 'inherit';

              const isEditing = editingChoreId === chore.id;

              return (
                <TableRow
                  key={chore.id}
                  sx={{
                    height: isEditing ? '80px' : 'auto',
                    backgroundColor: userColor,
                  }}
                >
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editedChore.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        size="small"
                      />
                    ) : (
                      chore.title
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small">
                        <Select
                          value={editedChore.assignedTo || currentUser.uid}
                          onChange={(e) =>
                            handleChange('assignedTo', e.target.value)
                          }
                        >
                          <MenuItem value={currentUser.uid}>
                            {currentUser.username || currentUser.email} (myself)
                          </MenuItem>
                          {groupMembers
                            .filter((m) => m.uid !== currentUser.uid)
                            .map((m) => (
                              <MenuItem key={m.uid} value={m.uid}>
                                {m.username || m.email}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : assignedUser ? (
                      assignedUser.username || assignedUser.email
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        value={editedChore.frequency}
                        onChange={(e) =>
                          handleChange('frequency', Math.max(1, e.target.value))
                        }
                        size="small"
                      />
                    ) : (
                      chore.frequency
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="date"
                        value={editedChore.startDate}
                        onChange={(e) =>
                          handleChange('startDate', e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      formatDate(dayjs(chore.startDate, 'YYYY-MM-DD'))
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <>
                        <IconButton color="primary" onClick={handleSaveClick}>
                          <Save />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={handleCancelEdit}
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
