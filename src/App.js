import React, { useRef, useState } from "react";
import "./styles.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyBmMi2eGb9vhH-KwLRvvpwtAtN-dxWYDMY",
  authDomain: "react-to-do-list-c6e77.firebaseapp.com",
  projectId: "react-to-do-list-c6e77",
  storageBucket: "react-to-do-list-c6e77.appspot.com",
  messagingSenderId: "1097868388671",
  appId: "1:1097868388671:web:80cffaf1e5241f44adcb8a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        {user ? (
          <>
            <h1>To-do-list ⚛️</h1>
            <SignOut />
          </>
        ) : (
          <>
            <h1>To-do-list ⚛️</h1>
          </>
        )}
      </header>
      <section>
        {user ? (
          <>
            <Form />
            <ToDoList uid={user.uid} />
            <Delete />
          </>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function Form() {
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const ToDosRef = firestore.collection(uid);
    await ToDosRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      state: "not_done"
    });

    setFormValue("");
  };
  return (
    <form onSubmit={sendMessage}>
      <input
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        placeholder="What do you want to do?"
      />
      <button type="submit" disabled={!formValue}>
        Add
      </button>
    </form>
  );
}

function ToDoList() {
  const { uid, photoURL } = auth.currentUser;
  const ToDosRef = firestore.collection(uid);
  const query = ToDosRef.orderBy("createdAt");
  const [todos] = useCollectionData(query, { idField: "id" });

  return (
    <>
      <main>
        {todos && todos.map((todo) => <ToDoItem key={todo.id} todo={todo} />)}
      </main>
    </>
  );
}

function ToDoItem(props) {
  const { text, state, id, createdAt } = props.todo;
  const Delete = async (key) => {
    const { uid } = auth.currentUser;
    await firestore.collection(uid).doc(key).delete();
  };
  const Change_State = async (key, state) => {
    const { uid } = auth.currentUser;
    if (state === "not_done")
      await firestore.collection(uid).doc(key).update({ state: "done" });
    else await firestore.collection(uid).doc(key).update({ state: "not_done" });
  };
  function getFormatDate(date) {
    var year = date.getFullYear();
    var month = 1 + date.getMonth();
    month = month >= 10 ? month : "0" + month;
    var day = date.getDate();
    day = day >= 10 ? day : "0" + day;
    return year + "-" + month + "-" + day;
  }
  return (
    <>
      <div className={`todo`}>
        <div className="text">
          <p className={state}>{text}</p>
          <span className="createdAt">
            {createdAt ? getFormatDate(createdAt.toDate()) : null}
          </span>
        </div>
        {state === "not_done" ? (
          <i
            className="far fa-check-circle"
            onClick={() => Change_State(id, state)}
          ></i>
        ) : (
          <i
            className="fas fa-eraser"
            onClick={() => Change_State(id, state)}
          ></i>
        )}
        <i className="far fa-times-circle" onClick={() => Delete(id)}></i>
      </div>
    </>
  );
}

function Delete() {
  const { uid } = auth.currentUser;
  const [IsEmpty, setIsEmpty] = useState();
  firestore.collection(uid).onSnapshot((snap) => {
    setIsEmpty(snap.empty);
  });
  const DeleteAll = async () => {
    const snapshot = await firestore.collection(uid).get();
    snapshot.forEach(async (doc) => {
      await firestore.collection(uid).doc(doc.id).delete();
    });
  };
  return (
    <>
      {!IsEmpty ? (
        <div className="delete">
          <span className="circle"></span>
          <span className="circle"></span>
          <span className="circle"></span>
          <span className="circle"></span>
          <span className="circle"></span>
          <span className="delete" onClick={DeleteAll}>
            <i className="far fa-trash-alt"></i>
          </span>
        </div>
      ) : (
        <div className="wait">
          <i className="fas fa-list-ul"></i>
          <p>Write Something!</p>
        </div>
      )}
    </>
  );
}
