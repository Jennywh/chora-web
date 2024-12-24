import React, { useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const getInitialFormState = () => ({
  title: '',
  assignedTo: '',
  startDate: new Date(),
  repeatType: 'none',
  repeatDays: 1,
  selectedWeekdays: [],
});

export function ChoreForm({
  groupMembers,
  currentUserUid,
  joinedGroup,
  fetchChores,
  onCancel, // Add onCancel prop
}) {
  const [formState, setFormState] = useState(getInitialFormState());

  const handleAddChore = async ({
    title,
    assignedTo,
    startDate,
    repeatFrequency,
  }) => {
    if (!title.trim() || !joinedGroup) return;
    try {
      const choresRef = collection(db, 'groups', joinedGroup.id, 'chores');
      await addDoc(choresRef, {
        title,
        assignedTo: assignedTo || currentUserUid,
        startDate,
        repeatFrequency,
        addedTime: new Date().toISOString(),
      });
      await fetchChores(joinedGroup.id);
    } catch (err) {
      console.error('Error adding chore:', err);
    }
  };

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleDateChange = (e) => {
    setFormState((prev) => ({
      ...prev,
      startDate: new Date(e.target.value),
    }));
  };

  const handleWeekdayToggle = (day) => {
    setFormState((prev) => ({
      ...prev,
      selectedWeekdays: prev.selectedWeekdays.includes(day)
        ? prev.selectedWeekdays.filter((d) => d !== day)
        : [...prev.selectedWeekdays, day].sort(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      title,
      assignedTo,
      startDate,
      repeatType,
      repeatDays,
      selectedWeekdays,
    } = formState;
    if (!title || !assignedTo || !startDate) return;

    const repeatFrequency = {
      type: repeatType,
      ...(repeatType === 'daily' && { days: repeatDays }),
      ...(repeatType === 'weekly' && { weekdays: selectedWeekdays }),
    };

    handleAddChore({
      title,
      assignedTo,
      startDate: startDate.toISOString().split('T')[0],
      repeatFrequency,
    });

    setFormState(getInitialFormState());
  };

  const {
    title,
    assignedTo,
    startDate,
    repeatType,
    repeatDays,
    selectedWeekdays,
  } = formState;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 3,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Add New Chore
      </Typography>

      <TextField
        label="Chore Title"
        value={title}
        onChange={handleChange('title')}
        required
        fullWidth
        sx={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
      />

      <FormControl
        fullWidth
        sx={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
      >
        <InputLabel id="assignedTo-label">Assign To</InputLabel>
        <Select
          labelId="assignedTo-label"
          id="assignedTo"
          value={assignedTo}
          onChange={handleChange('assignedTo')}
          required
        >
          <MenuItem value="">
            <em>Select a Member</em>
          </MenuItem>
          {groupMembers &&
            groupMembers.map((member) => (
              <MenuItem key={member.uid} value={member.uid}>
                {member.username}
                {member.uid === currentUserUid ? ' (myself)' : ''}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <TextField
        label="Start Date"
        type="date"
        value={startDate.toISOString().split('T')[0]}
        onChange={handleDateChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: new Date().toISOString().split('T')[0] }}
        required
        fullWidth
        sx={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
      />

      <FormControl
        fullWidth
        sx={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
      >
        <InputLabel id="repeatType-label">Repeat</InputLabel>
        <Select
          labelId="repeatType-label"
          id="repeatType"
          value={repeatType}
          onChange={handleChange('repeatType')}
        >
          <MenuItem value="none">Don't Repeat</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
        </Select>
      </FormControl>

      {repeatType === 'daily' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Repeat Every"
            type="number"
            value={repeatDays}
            onChange={handleChange('repeatDays')}
            inputProps={{ min: 1, max: 30 }}
            sx={{
              width: '100px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
            }}
          />
          <Typography>days</Typography>
        </Box>
      )}

      {repeatType === 'weekly' && (
        <Box>
          <Typography>Repeat On</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {WEEKDAYS.map((day) => (
              <Chip
                key={day.value}
                label={day.label.slice(0, 3)}
                onClick={() => handleWeekdayToggle(day.value)}
                color={
                  selectedWeekdays.includes(day.value) ? 'primary' : 'default'
                }
                clickable
                sx={{ borderRadius: '4px' }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '4px',
            paddingY: 1.5,
          }}
        >
          Add Chore
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '4px',
            paddingY: 1.5,
          }}
          onClick={onCancel} // Add onClick handler for cancel button
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
