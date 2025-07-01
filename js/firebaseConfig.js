import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCav9NoV9h-aq1t-IaPlgUmw68TR3PBmyY",
    authDomain: "tasklist-23fb2.firebaseapp.com",
    databaseURL: "https://tasklist-23fb2-default-rtdb.firebaseio.com",
    projectId: "tasklist-23fb2",
    storageBucket: "tasklist-23fb2.appspot.com",
    messagingSenderId: "1030433370716",
    appId: "1:1030433370716:web:c05270c83cac4278686c99",
    measurementId: "G-HK3WW1MQDB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
