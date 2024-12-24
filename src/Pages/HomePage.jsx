import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

// MUI Imports
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Chip,
} from '@mui/material';

import ManageChores from '../components/ManageChores';
import WeeklySchedule from '../components/WeeklySchedule';
import DailyView from '../components/DailyView';

export default function HomePage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [joinedGroup, setJoinedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [dailyCompletions, setDailyCompletions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Group create/join states
  const [groupName, setGroupName] = useState('');
  const [groupIdInput, setGroupIdInput] = useState('');

  // View toggles: "manage", "schedule", "daily"
  const [view, setView] = useState('manage');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
      } else {
        setCurrentUser(user);
        // Load user doc
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          if (data.groupId) {
            await loadGroupData(data.groupId);
            setSelectedMembers([]); // Select all members by default
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  async function loadGroupData(gId) {
    try {
      const groupRef = doc(db, 'groups', gId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setJoinedGroup({ id: gId, ...groupSnap.data() });
        await fetchGroupMembers(gId);
        await fetchChores(gId);
        await fetchDailyCompletions(gId);
      }
    } catch (err) {
      console.error('Error loading group:', err);
    }
  }

  async function fetchGroupMembers(gId) {
    try {
      const usersRef = collection(db, 'users');
      const qUsers = query(usersRef, where('groupId', '==', gId));
      const snap = await getDocs(qUsers);
      const membersArray = snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      }));
      setGroupMembers(membersArray);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }

  async function fetchChores(gId) {
    try {
      const choresRef = collection(db, 'groups', gId, 'chores');
      const choresSnap = await getDocs(choresRef);
      const choresArray = choresSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChores(choresArray);
    } catch (err) {
      console.error('Error fetching chores:', err);
    }
  }

  async function fetchDailyCompletions(gId) {
    try {
      const dailyRef = collection(db, 'groups', gId, 'dailyCompletions');
      const dailySnap = await getDocs(dailyRef);
      const dailyArray = dailySnap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setDailyCompletions(dailyArray);
    } catch (err) {
      console.error('Error fetching daily completions:', err);
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) return;
    try {
      const newGroupId = Date.now().toString();
      await setDoc(doc(db, 'groups', newGroupId), {
        name: groupName,
        owner: currentUser.uid,
      });
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { groupId: newGroupId },
        { merge: true }
      );

      setGroupName('');
      await loadGroupData(newGroupId);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  }

  async function handleJoinGroup() {
    if (!groupIdInput.trim()) return;
    try {
      const groupRef = doc(db, 'groups', groupIdInput);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        alert('Group not found!');
        return;
      }
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { groupId: groupIdInput },
        { merge: true }
      );

      setGroupIdInput('');
      await loadGroupData(groupIdInput);
    } catch (err) {
      console.error('Error joining group:', err);
    }
  }

  async function handleEditChore(updatedChore) {
    const { id, ...data } = updatedChore;
    await setDoc(doc(db, 'groups', joinedGroup.id, 'chores', id), data, {
      merge: true,
    });
    await fetchChores(joinedGroup.id);
  }

  async function handleDeleteChore(choreId) {
    await deleteDoc(doc(db, 'groups', joinedGroup.id, 'chores', choreId));
    await fetchChores(joinedGroup.id);
  }

  // Add a new chore
  async function handleAddChore({ title, frequency, startDate, assignedTo }) {
    if (!title.trim() || !joinedGroup) return;
    try {
      const choresRef = collection(db, 'groups', joinedGroup.id, 'chores');
      await addDoc(choresRef, {
        title,
        frequency,
        startDate,
        assignedTo: assignedTo || currentUser.uid,
        addedTime: new Date().toISOString(),
      });
      await fetchChores(joinedGroup.id);
    } catch (err) {
      console.error('Error adding chore:', err);
    }
  }

  // Toggle daily completion
  async function handleToggleDailyCompletion(choreId, date, checked) {
    if (!joinedGroup) return;
    try {
      const dailyRef = collection(
        db,
        'groups',
        joinedGroup.id,
        'dailyCompletions'
      );
      const docId = `${choreId}_${date}`;
      const docRef = doc(dailyRef, docId);

      await setDoc(
        docRef,
        {
          choreId,
          date,
          completed: checked,
        },
        { merge: true }
      );
      await fetchDailyCompletions(joinedGroup.id);
    } catch (err) {
      console.error('Error toggling daily completion:', err);
    }
  }

  const handleMemberFilterChange = (uid) => {
    setSelectedMembers((prev) => (prev.includes(uid) ? [] : [uid]));
  };

  function handleSignOut() {
    signOut(auth);
  }

  if (!currentUser || userData === null) {
    return (
      <Typography variant="h6" sx={{ margin: 2 }}>
        Loading...
      </Typography>
    );
  }

  // Display the username or fallback to email
  const displayName = userData.username || currentUser.email;

  return (
    <>
      {/* Top AppBar for navigation and sign-out */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chora
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            {userData.username}, Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ marginY: 3 }}>
        {!joinedGroup ? (
          <>
            <Box
              sx={{
                marginBottom: 2,
                padding: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Join an Existing Group
              </Typography>
              <TextField
                label="Enter Group ID"
                variant="outlined"
                size="small"
                value={groupIdInput}
                onChange={(e) => setGroupIdInput(e.target.value)}
                sx={{ marginRight: 1 }}
              />
              <Button variant="contained" onClick={handleJoinGroup}>
                Join Group
              </Button>
            </Box>
            <Box
              sx={{
                marginBottom: 2,
                padding: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Create a New Group
              </Typography>
              <TextField
                label="New Group Name"
                variant="outlined"
                size="small"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                sx={{ marginRight: 1 }}
              />
              <Button variant="contained" onClick={handleCreateGroup}>
                Create Group
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Group Info */}
            <Box
              sx={{
                marginBottom: 2,
                padding: 2,
                backgroundColor: '#E1F1D8',
                borderRadius: 1,
              }}
            >
              <Typography variant="h5" component="span">
                {joinedGroup.name}
              </Typography>
              <Typography
                variant="body1"
                component="span"
                sx={{ marginLeft: 1 }}
              >
                (#{joinedGroup.id})
              </Typography>

              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginY: 2 }}
              >
                {groupMembers.map((member) => (
                  <Chip
                    key={member.uid}
                    label={member.username || member.email}
                    onClick={() => handleMemberFilterChange(member.uid)}
                    color={
                      selectedMembers.includes(member.uid)
                        ? 'primary'
                        : 'default'
                    }
                    sx={{
                      backgroundColor: selectedMembers.includes(member.uid)
                        ? 'primary'
                        : 'default',
                    }}
                  />
                ))}
              </Box>
            </Box>
            {/* Member Filter */}

            {/* View Toggles */}
            <Box sx={{ marginY: 2 }}>
              <Button
                variant={view === 'manage' ? 'contained' : 'outlined'}
                onClick={() => setView('manage')}
                sx={{ marginRight: 1 }}
                size="small"
              >
                Manage Chores
              </Button>
              <Button
                variant={view === 'daily' ? 'contained' : 'outlined'}
                onClick={() => setView('daily')}
                sx={{ marginRight: 1 }}
                size="small"
              >
                Daily View
              </Button>
              <Button
                variant={view === 'schedule' ? 'contained' : 'outlined'}
                onClick={() => setView('schedule')}
                size="small"
              >
                Weekly Schedule
              </Button>
            </Box>

            {/* Conditionally Render Subviews */}
            {view === 'manage' && (
              <ManageChores
                chores={chores}
                groupMembers={groupMembers}
                onAddChore={handleAddChore}
                onEditChore={handleEditChore}
                onDeleteChore={handleDeleteChore}
                currentUser={currentUser}
                currentUserName={userData.username || userData.email}
                selectedMembers={selectedMembers}
              />
            )}
            {view === 'schedule' && (
              <WeeklySchedule
                chores={chores}
                groupMembers={groupMembers}
                selectedMembers={selectedMembers}
              />
            )}
            {view === 'daily' && (
              <DailyView
                chores={chores}
                groupMembers={groupMembers}
                dailyCompletions={dailyCompletions}
                onToggleDailyCompletion={handleToggleDailyCompletion}
                selectedMembers={selectedMembers}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </Container>
    </>
  );
}
