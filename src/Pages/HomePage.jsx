import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Tabs,
  Tab,
  Modal,
} from '@mui/material';
import ManageChores from '../components/ManageChores';
import GroupSetup from '../components/GroupSetup';
import Reports from '../components/Reports';
import TodayIcon from '@mui/icons-material/Today';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarView from '../components/CalendarView';

export default function HomePage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [joinedGroup, setJoinedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [dailyCompletions, setDailyCompletions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupIdInput, setGroupIdInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [view, setView] = useState('calendar'); // Set default view to 'calendar'
  const [isManageChoresModalOpen, setIsManageChoresModalOpen] = useState(false); // State for modal

  const loadGroupData = useCallback(async (gId) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
      } else {
        setCurrentUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          if (data.groupId) {
            await loadGroupData(data.groupId);
            setSelectedMembers([]);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, loadGroupData]);

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
    if (!groupName.trim()) {
      setErrorMessage('Group name cannot be empty.');
      return;
    }
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
      setErrorMessage('');
    } catch (err) {
      console.error('Error creating group:', err);
      setErrorMessage('Error creating group. Please try again.');
    }
  }

  async function handleJoinGroup() {
    if (!groupIdInput.trim()) {
      setErrorMessage('Group ID cannot be empty.');
      return;
    }
    try {
      const groupRef = doc(db, 'groups', groupIdInput);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        setErrorMessage('Group not found.');
        return;
      }
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { groupId: groupIdInput },
        { merge: true }
      );

      setGroupIdInput('');
      await loadGroupData(groupIdInput);
      setErrorMessage('');
    } catch (err) {
      console.error('Error joining group:', err);
      setErrorMessage('Error joining group. Please try again.');
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

  const handleOpenManageChoresModal = () => {
    setIsManageChoresModalOpen(true);
  };

  const handleCloseManageChoresModal = () => {
    setIsManageChoresModalOpen(false);
  };

  if (!currentUser || userData === null) {
    return (
      <Typography variant="h6" sx={{ margin: 2 }}>
        Loading...
      </Typography>
    );
  }

  return (
    <>
      {joinedGroup && (
        <AppBar
          position="static"
          sx={{ backgroundColor: '#ffffff', color: '#333', boxShadow: 'none' }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 24px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Chora
              </Typography>
            </Box>
            <Tabs
              value={view}
              onChange={(e, newValue) => setView(newValue)}
              textColor="inherit"
              indicatorColor="primary"
              sx={{ flexGrow: 1, marginLeft: 4 }}
            >
              <Tab
                value="calendar"
                label="Calendar"
                icon={<TodayIcon />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
              <Tab
                value="reports"
                label="Reports"
                icon={<AssessmentIcon />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
            </Tabs>
            <Button
              color="primary"
              onClick={handleSignOut}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        {!joinedGroup ? (
          <GroupSetup
            onJoinGroup={handleJoinGroup}
            onCreateGroup={handleCreateGroup}
            groupIdInput={groupIdInput}
            setGroupIdInput={setGroupIdInput}
            groupName={groupName}
            setGroupName={setGroupName}
            errorMessage={errorMessage}
          />
        ) : (
          <>
            <Box
              sx={{
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: 2,
                marginBottom: 3,
                position: 'relative',
                maxWidth: '400px', // Limit the width
                marginLeft: 0, // Align to the left
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenManageChoresModal}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  fontSize: '0.75rem',
                }} // Smaller button
              >
                Manage
              </Button>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, marginBottom: 1, fontSize: '1.25rem' }} // Smaller font size
              >
                {joinedGroup.name}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ marginBottom: 2, fontSize: '0.875rem' }} // Smaller font size
              >
                Group ID: #{joinedGroup.id}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {groupMembers.map((member) => (
                  <Chip
                    key={member.uid}
                    label={
                      member.uid === currentUser.uid
                        ? `${member.username || member.email} (myself)`
                        : member.username || member.email
                    }
                    onClick={() => handleMemberFilterChange(member.uid)}
                    color={
                      selectedMembers.includes(member.uid)
                        ? 'primary'
                        : 'default'
                    }
                    sx={{ fontSize: '0.75rem' }} // Smaller chip font size
                  />
                ))}
              </Box>
            </Box>
            {view === 'calendar' && (
              <CalendarView
                chores={chores}
                groupMembers={groupMembers}
                selectedMembers={selectedMembers}
                dailyCompletions={dailyCompletions}
                onToggleDailyCompletion={handleToggleDailyCompletion}
                currentUser={currentUser}
              />
            )}
            {view === 'reports' && (
              <Reports
                chores={chores}
                dailyCompletions={dailyCompletions}
                groupMembers={groupMembers}
              />
            )}
          </>
        )}
      </Container>

      <Modal
        open={isManageChoresModalOpen}
        onClose={handleCloseManageChoresModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <ManageChores
            chores={chores}
            groupMembers={groupMembers}
            onEditChore={handleEditChore}
            onDeleteChore={handleDeleteChore}
            currentUser={currentUser}
            currentUserName={userData.username || userData.email}
            selectedMembers={selectedMembers}
            joinedGroup={joinedGroup}
            fetchChores={fetchChores}
          />
        </Box>
      </Modal>
    </>
  );
}
