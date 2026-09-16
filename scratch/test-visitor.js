const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAk7dsgYTZGQZ3WFpaL3Qd8Lci5vLSQjYo",
  authDomain: "studio-6314261851-52823.firebaseapp.com",
  projectId: "studio-6314261851-52823",
  storageBucket: "studio-6314261851-52823.firebasestorage.app",
  messagingSenderId: "949383192269",
  appId: "1:949383192269:web:64168dbb17fd749ba59384",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

getDoc(doc(db, 'counters', 'visitors'))
  .then(s => {
    console.log('Doc exists?', s.exists(), 'data:', s.data());
    process.exit(0);
  })
  .catch(e => {
    console.error('Error fetching doc:', e.message);
    process.exit(1);
  });
