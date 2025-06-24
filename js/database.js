import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCav9NoV9h-aq1t-IaPlgUmw68TR3PBmyY",
    authDomain: "tasklist-23fb2.firebaseapp.com",
    databaseURL: "https://tasklist-23fb2-default-rtdb.firebaseio.com",
    projectId: "tasklist-23fb2",
    storageBucket: "tasklist-23fb2.firebasestorage.app",
    messagingSenderId: "1030433370716",
    appId: "1:1030433370716:web:c05270c83cac4278686c99",
    measurementId: "G-HK3WW1MQDB"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasks =  "Tasks";

export async function addTask(name, column, description){
    try{
        const taskData = {name: name, column: column, description: description}
        const docRef = await addDoc(collection(db, tasks), taskData);

        const task = {
            id: docRef.id,
            name: taskData.name,
            column: taskData.column,
            description: taskData.description
        };

        return task;
    }
    catch(e){
        console.error(e);
    }
}

export async function removeTask(id) {
    try{
        await deleteDoc(doc(db, tasks, id));
    }
    catch(e){
        console.error(e);
    }
}

export async function updateTask(id, name, column, description) {
    try{
        const currentTask = {name: name, column: column, description: description}
        await updateDoc(doc(db, tasks, id), currentTask);
    }
    catch(e){
        console.error(e);
    }
}

export async function getTask(id) {
    try{
        const docRef = doc(db, tasks, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            return {
                id: docSnap.id,
                name: data.name,
                column: data.column,
                description: data.description
            };
        } 
        else {
            return null;
        }
    }
    catch(e){
        console.error(e);
    }
}

export async function getTasks() {
    try{
        const querySnapshot = await getDocs(collection(db, tasks));
        const tasksArray = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                column: data.column,
                description: data.description
            };
        });

        return tasksArray;
    }
    catch(e){
        console.error(e);
        return [];
    }
}