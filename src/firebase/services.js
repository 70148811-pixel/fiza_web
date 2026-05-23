import { 
  auth, 
  db, 
  googleProvider, 
  isDemoMode 
} from "./config";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  deleteUser
} from "firebase/auth";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

// ==========================================
// LOCALSTORAGE / MOCK SEEDING & UTILITIES
// ==========================================
const seedMockData = () => {
  if (!localStorage.getItem("nexus_users")) {
    const mockUsers = [
      {
        uid: "mock-admin-id",
        email: "admin@nexushub.com",
        displayName: "Sarah Admin",
        role: "admin",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
        createdAt: new Date().toISOString()
      },
      {
        uid: "mock-user-id",
        email: "user@nexushub.com",
        displayName: "John Doe",
        role: "user",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("nexus_users", JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem("nexus_tasks")) {
    const mockTasks = [
      {
        id: "task-1",
        title: "Review Design Specifications",
        description: "Verify that color contrasts conform to WCAG contrast standards in light mode.",
        category: "Design",
        dueDate: "2026-05-28",
        priority: "High",
        status: "In Progress",
        userId: "mock-user-id",
        userEmail: "user@nexushub.com",
        userName: "John Doe",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "task-2",
        title: "Implement Authentication Flow",
        description: "Integrate Google sign-in and email auth context provider with protective route guards.",
        category: "Development",
        dueDate: "2026-05-25",
        priority: "High",
        status: "Completed",
        userId: "mock-user-id",
        userEmail: "user@nexushub.com",
        userName: "John Doe",
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "task-3",
        title: "Database Deployment Checklist",
        description: "Configure Firestore security rules and create required composite indices for chat queries.",
        category: "DevOps",
        dueDate: "2026-06-02",
        priority: "Medium",
        status: "To Do",
        userId: "mock-admin-id",
        userEmail: "admin@nexushub.com",
        userName: "Sarah Admin",
        createdAt: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: "task-4",
        title: "System Load Performance Audit",
        description: "Run lighthouse audits and benchmark simulated database read/write operation latencies.",
        category: "QA",
        dueDate: "2026-05-24",
        priority: "Low",
        status: "To Do",
        userId: "mock-user-id",
        userEmail: "user@nexushub.com",
        userName: "John Doe",
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    localStorage.setItem("nexus_tasks", JSON.stringify(mockTasks));
  }

  if (!localStorage.getItem("nexus_chats")) {
    const mockChats = {
      "mock-admin-id_mock-user-id": [
        {
          id: "m-1",
          senderId: "mock-admin-id",
          text: "Hi John, how is the task application security implementation going?",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "m-2",
          senderId: "mock-user-id",
          text: "Hi Sarah! It is going great. I just finished the protected routes setup and am testing Firestore rules now.",
          timestamp: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: "m-3",
          senderId: "mock-admin-id",
          text: "Perfect. Let me know if you run into any issues. I can review the pull request tonight.",
          timestamp: new Date(Date.now() - 2400000).toISOString()
        }
      ]
    };
    localStorage.setItem("nexus_chats", JSON.stringify(mockChats));
  }
};

// Seed only if in demo mode
if (isDemoMode) {
  seedMockData();
}

// Helper to get local data
const getLocalData = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ==========================================
// 1. AUTHENTICATION SERVICES
// ==========================================
export const registerUser = async (email, password, displayName, role) => {
  if (isDemoMode) {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getLocalData("nexus_users");
    
    if (users.find(u => u.email === email)) {
      throw new Error("auth/email-already-in-use");
    }

    const newUser = {
      uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
      email,
      displayName,
      role: role || "user",
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setLocalData("nexus_users", users);
    
    // Set active session in sessionStorage
    sessionStorage.setItem("nexus_active_user", JSON.stringify(newUser));
    return { user: newUser };
  } else {
    // Real Firebase Sign Up
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional fields in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || "Anonymous",
      role: role || "user",
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || "U")}`,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(userDocRef, profile);
    return { user, profile };
  }
};

export const loginUser = async (email, password) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Special shortcut bypasses
    if (email === "admin@nexushub.com" && password === "admin123") {
      const adminUser = getLocalData("nexus_users").find(u => u.uid === "mock-admin-id");
      sessionStorage.setItem("nexus_active_user", JSON.stringify(adminUser));
      return { user: adminUser };
    }
    if (email === "user@nexushub.com" && password === "user123") {
      const normalUser = getLocalData("nexus_users").find(u => u.uid === "mock-user-id");
      sessionStorage.setItem("nexus_active_user", JSON.stringify(normalUser));
      return { user: normalUser };
    }

    const users = getLocalData("nexus_users");
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("auth/user-not-found");
    }
    // Simplistic mock password check (matches email name + 123)
    const expectedPassword = email.split('@')[0] + "123";
    if (password !== expectedPassword && password !== "password123") {
      throw new Error("auth/wrong-password");
    }

    sessionStorage.setItem("nexus_active_user", JSON.stringify(user));
    return { user };
  } else {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await getUserProfile(userCredential.user.uid);
    return { user: userCredential.user, profile: userProfile };
  }
};

export const loginWithGoogle = async () => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const randomSuffix = Math.floor(Math.random() * 100);
    const googleUser = {
      uid: "google-mock-uid-" + randomSuffix,
      email: `google.user${randomSuffix}@gmail.com`,
      displayName: `Google Explorer ${randomSuffix}`,
      role: "user", // Google users default to normal user
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=google-${randomSuffix}`,
      createdAt: new Date().toISOString()
    };
    
    const users = getLocalData("nexus_users");
    if (!users.find(u => u.email === googleUser.email)) {
      users.push(googleUser);
      setLocalData("nexus_users", users);
    }
    
    sessionStorage.setItem("nexus_active_user", JSON.stringify(googleUser));
    return { user: googleUser };
  } else {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    // Check if user already has a document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let profile;
    if (!userDoc.exists()) {
      profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Google User",
        role: "user", // Defaults to normal user
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || "G")}`,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
    } else {
      profile = userDoc.data();
    }
    
    return { user, profile };
  }
};

export const logoutUser = async () => {
  if (isDemoMode) {
    sessionStorage.removeItem("nexus_active_user");
    return true;
  } else {
    await signOut(auth);
    return true;
  }
};

export const resetUserPassword = async (email) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = getLocalData("nexus_users");
    if (!users.find(u => u.email === email)) {
      throw new Error("auth/user-not-found");
    }
    return true;
  } else {
    await sendPasswordResetEmail(auth, email);
    return true;
  }
};

export const deleteUserAccount = async (uid) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Remove from mock users
    let users = getLocalData("nexus_users");
    users = users.filter(u => u.uid !== uid);
    setLocalData("nexus_users", users);
    
    // Clean up tasks
    let tasks = getLocalData("nexus_tasks");
    tasks = tasks.filter(t => t.userId !== uid);
    setLocalData("nexus_tasks", tasks);
    
    sessionStorage.removeItem("nexus_active_user");
    return true;
  } else {
    // Delete Firestore profile document
    await deleteDoc(doc(db, "users", uid));
    
    // In actual Firebase, deleting the currently logged-in user:
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      await deleteUser(currentUser);
    }
    return true;
  }
};

// ==========================================
// 2. USER PROFILE SERVICES
// ==========================================
export const getUserProfile = async (uid) => {
  if (isDemoMode) {
    const users = getLocalData("nexus_users");
    const user = users.find(u => u.uid === uid);
    return user || null;
  } else {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
};

export const getAllUsers = async () => {
  if (isDemoMode) {
    return getLocalData("nexus_users");
  } else {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }
};

export const updateUserRole = async (uid, role) => {
  if (isDemoMode) {
    const users = getLocalData("nexus_users");
    const userIdx = users.findIndex(u => u.uid === uid);
    if (userIdx !== -1) {
      users[userIdx].role = role;
      setLocalData("nexus_users", users);
    }
    return true;
  } else {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { role });
    return true;
  }
};

// ==========================================
// 3. TASK CRUD SERVICES
// ==========================================
export const createTask = async (taskData) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tasks = getLocalData("nexus_tasks");
    
    const newTask = {
      id: "task-" + Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask); // Add to beginning
    setLocalData("nexus_tasks", tasks);
    return newTask;
  } else {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: new Date().toISOString()
    });
    
    // Add id to task document representation
    await updateDoc(docRef, { id: docRef.id });
    return { id: docRef.id, ...taskData };
  }
};

export const getTasks = async (userId, role) => {
  if (isDemoMode) {
    const tasks = getLocalData("nexus_tasks");
    if (role === "admin") {
      return tasks; // Admin gets everything
    } else {
      return tasks.filter(t => t.userId === userId); // Normal user gets only their own
    }
  } else {
    let q;
    if (role === "admin") {
      q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "tasks"), 
        where("userId", "==", userId), 
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push(doc.data());
    });
    return tasks;
  }
};

export const getSingleTask = async (taskId) => {
  if (isDemoMode) {
    const tasks = getLocalData("nexus_tasks");
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");
    return task;
  } else {
    const docRef = doc(db, "tasks", taskId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Task not found");
    return docSnap.data();
  }
};

export const updateTask = async (taskId, taskData) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tasks = getLocalData("nexus_tasks");
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...taskData };
      setLocalData("nexus_tasks", tasks);
      return tasks[idx];
    }
    throw new Error("Task not found");
  } else {
    const docRef = doc(db, "tasks", taskId);
    await updateDoc(docRef, taskData);
    return { id: taskId, ...taskData };
  }
};

export const deleteTask = async (taskId) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let tasks = getLocalData("nexus_tasks");
    tasks = tasks.filter(t => t.id !== taskId);
    setLocalData("nexus_tasks", tasks);
    return true;
  } else {
    const docRef = doc(db, "tasks", taskId);
    await deleteDoc(docRef);
    return true;
  }
};

// ==========================================
// 4. REAL-TIME CHAT SERVICES
// ==========================================
export const sendChatMessage = async (chatId, messageData) => {
  const { senderId, text } = messageData;
  const msgObj = {
    id: "msg-" + Math.random().toString(36).substr(2, 9),
    senderId,
    text,
    timestamp: new Date().toISOString()
  };

  if (isDemoMode) {
    const chats = JSON.parse(localStorage.getItem("nexus_chats") || "{}");
    if (!chats[chatId]) {
      chats[chatId] = [];
    }
    chats[chatId].push(msgObj);
    localStorage.setItem("nexus_chats", JSON.stringify(chats));
    
    // Trigger custom event for simulated real-time updates in other tabs/elements
    const event = new CustomEvent(`chat-sync-${chatId}`, { detail: msgObj });
    window.dispatchEvent(event);
    return msgObj;
  } else {
    const msgCollectionRef = collection(db, "chats", chatId, "messages");
    await addDoc(msgCollectionRef, msgObj);
    return msgObj;
  }
};

export const getChatMessages = (chatId, callback) => {
  if (isDemoMode) {
    // Initial fetch
    const chats = JSON.parse(localStorage.getItem("nexus_chats") || "{}");
    const initialMessages = chats[chatId] || [];
    callback(initialMessages);
    
    // Setup listener
    const handleNewMessage = (e) => {
      const chatsUpdated = JSON.parse(localStorage.getItem("nexus_chats") || "{}");
      callback(chatsUpdated[chatId] || []);
    };
    
    window.addEventListener(`chat-sync-${chatId}`, handleNewMessage);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(`chat-sync-${chatId}`, handleNewMessage);
    };
  } else {
    // Real Firestore real-time listener
    const msgCollectionRef = collection(db, "chats", chatId, "messages");
    const q = query(msgCollectionRef, orderBy("timestamp", "asc"));
    
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      callback(messages);
    });
  }
};
