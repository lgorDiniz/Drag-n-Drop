import { db } from "./firebaseConfig.js";
import { collection, getDocs, getDoc, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { query, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const tasks = "Tasks";

export async function addTask(user, name, column, description) {
  if (!user) throw new Error("Not authenticated");

  const taskData = { name, column, description, userId: user.uid };
  const docRef = await addDoc(collection(db, tasks), taskData);

  return {
    id: docRef.id,
    name,
    column,
    description,
  };
}

export async function removeTask(user, id) {
  if (!user) throw new Error("Not authenticated");

  const docRef = doc(db, tasks, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
    throw new Error("Not authorized to delete this task");
  }

  await deleteDoc(docRef);
}

export async function updateTask(user, id, name, column, description) {
  if (!user) throw new Error("Not authenticated");

  const docRef = doc(db, tasks, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
    throw new Error("Not authorized to update this task");
  }

  const currentTask = { name, column, description, userId: user.uid };
  await updateDoc(docRef, currentTask);
}

export async function getTasks(user) {
  if (!user) throw new Error("Not authenticated");

  const tasksRef = collection(db, tasks);
  const q = query(tasksRef, where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      column: data.column,
      description: data.description,
    };
  });
}

export async function getTask(user, id) {
  if (!user) throw new Error("Not authenticated");

  const docRef = doc(db, tasks, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (data.userId !== user.uid) {
    console.warn("Access denied: Task does not belong to this user.");
    return null;
  }

  return {
    id: docSnap.id,
    name: data.name,
    column: data.column,
    description: data.description,
  };
}