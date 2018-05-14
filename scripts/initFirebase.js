export function initFirebase(firebaseConfig) {

    firebase.initializeApp(firebaseConfig);
    if (!window.firebase ||
            !(firebase.app instanceof Function) ||
            !firebase.app().options
            ) {
        window.alert(
                `You have not configured and imported the Firebase SDK.
                Make sure you go through the codelab setup instructions and make 
                sure you are running the codelab using \`firebase serve\``
                )
    }

    firebase.firestore().settings({timestampsInSnapshots: true})
}