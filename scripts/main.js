import { initFirebase } from './initFirebase.js';
import { Message } from './Message.js';
import { List } from './List.js';

const path = location.pathname;

// Initialize Firebase
const config = {
    apiKey: "AIzaSyC_DO9wHhHtZ0Ei7BtmM7mLcMG-4h0rx-I",
    authDomain: "freindlychat-16c81.firebaseapp.com",
    databaseURL: "https://freindlychat-16c81.firebaseio.com",
    projectId: "freindlychat-16c81",
    storageBucket: "freindlychat-16c81.appspot.com",
    messagingSenderId: "743147525524"
};

initFirebase(config);

switch (path) {

    case '/':
        index()
        break;

    case '/list.html':
        list();
        break;

    default:
        break;
}

function index() {
    const messaging = new Message()
    firebase.messaging().onTokenRefresh(() => {
        alert('Token refreshed.')
    })
}

function list() {
    new List().load()
    new List().execute()
}