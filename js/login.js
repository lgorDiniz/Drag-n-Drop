import {auth, db } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {collection, addDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

async function createUser(username, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
        displayName: username
    });
}

async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("enter");
    const createUserButton = document.getElementById("createUser");

    const signUpButton = document.getElementById("signUp");
    const createUsername = document.getElementById("createUsername");
    const createEmail = document.getElementById("createEmail");
    const createPassword = document.getElementById("createPassword");

    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            try {
                await login(email, password);
                window.location.href = "tasks.html";
            } catch (e) {
                if (e.code === "auth/invalid-credential") {
                    alert("This user doesn't exist.");
                } else {
                    console.error(e);
                }
            }
        });
    }

    if (createUserButton) {
        createUserButton.addEventListener("click", () => {
            window.location.href = "signup.html";
        });
    }

    if (signUpButton) {
        signUpButton.addEventListener("click", async () => {
            const email = createEmail.value.trim();
            const password = createPassword.value.trim();
            const username = createUsername.value.trim();
            try {
                await createUser(username, email, password);
                window.location.href = "index.html";
            } catch (e) {
                if (e.code === "auth/email-already-in-use") {
                    alert("This email is already in use.");
                } else {
                    console.error(e);
                }
            }
        });
    }
});
