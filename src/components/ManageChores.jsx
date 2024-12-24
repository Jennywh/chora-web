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
  TextField,
  MenuItem,
  Select,
  FormControl,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils';
import { ChoreForm } from '../components/ChoreForm';

export default function ManageChores({
  chores,
  groupMembers,
  onAddChore,
  onEditChore,
  onDeleteChore,
  currentUser,
  selectedMembers,
  joinedGroup,
  fetchChores,
}) {
  const [editingChoreId, setEditingChoreId] = useState(null);
  const [editedChore, setEditedChore] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddButtonClick = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  const handleAddChoreClick = (newChore) => {
    onAddChore({
      ...newChore,
      assignedTo: newChore.assignedTo || currentUser.uid,
      addedTime: new Date().toISOString(),
    });
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
    .sort((a, b) => new Date(b.addedTime) - new Date(a.addedTime));

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
        Manage Chores
      </Typography>

      <Box sx={{ marginBottom: 3 }}>
        {showAddForm ? (
          <ChoreForm
            onSubmit={(newChore) => {
              handleAddChoreClick(newChore);
              handleFormClose();
            }}
            onCancel={handleFormClose} // Add onCancel prop
            groupMembers={groupMembers}
            currentUserUid={currentUser.uid}
            joinedGroup={joinedGroup}
            fetchChores={fetchChores}
          />
        ) : (
          <Button variant="contained" color="primary" onClick={handleAddButtonClick}>
            Add Chore
          </Button>
        )}
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
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Repeats Every (Days)
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                    backgroundColor: isEditing ? '#f9f9f9' : 'transparent',
                  }}
                >
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editedChore.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography>{chore.title}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small" fullWidth>
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
                    ) : (
                      <Typography>
                        {assignedUser
                          ? assignedUser.username || assignedUser.email
                          : 'Unknown'}
                      </Typography>
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
                        fullWidth
                      />
                    ) : (
                      <Typography>{chore.frequency}</Typography>
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
                        fullWidth
                      />
                    ) : (
                      <Typography>
                        {formatDate(dayjs(chore.startDate, 'YYYY-MM-DD'))}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="primary" onClick={handleSaveClick}>
                          <Save />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={handleCancelEdit}
                        >
                          <Cancel />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredChores.length === 0 && (
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ textAlign: 'center', marginTop: 2 }}
        >
          No chores to display.
        </Typography>
      )}
    </Box>
  );
}
