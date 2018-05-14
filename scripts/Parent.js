export class Parent {

    constructor() {
        this.initFirebase()

        // A loading image URL.
        this.loadingImageUrl = "https://www.google.com/images/spin-32.gif"

        // Shortcuts to DOM Elements.
        this.signIn = this.selector("#sign-in")
        this.signOut = this.selector("#sign-out")
        this.userName = this.selector("#user-name")
        this.userPic = this.selector("#user-pic")
        this.snackbar = this.selector("#snackbar")

        // User sign in and out
        this.selector("#sign-in").addEventListener("click", event => this.userSignIn(event))
        this.selector("#sign-out").addEventListener("click", event => this.userSignOut(event))

        // Initiates Firebase auth and listen to auth state changes.
        this.auth.onAuthStateChanged(user => this.onAuthStateChanged(user))
    }

    /*
     * initFirebase
     */

    // Sets up shortcuts to Firebase features and initiate firebase auth.
    initFirebase() {
        this.auth = firebase.auth()
        this.storage = firebase.storage()
        this.database = firebase.firestore()
    }

    // Triggers when the auth state change for instance when the user signs-in or signs-out.
    onAuthStateChanged(user) {
        // User is signed in!
        if (user) {
            // Get profile pic and user's name from the Firebase user object.
            const profilePicUrl = user.photoURL
            const userName = user.displayName

            // Set the user's profile pic and name.
            this.userPic.setAttribute(
                "src",
                profilePicUrl || "/images/profile_placeholder.png"
            )
            this.userPic.setAttribute("alt", userName || "anonymous")
            this.userName.textContent = userName

            // Show user's profile and sign-out button.
            this.userName.style.display = "block"
            this.userPic.style.display = "block"
            this.signOut.style.display = "block"

            // Hide sign-in button.
            this.signIn.style.display = "none"

            this.setSnackbar("sign in!")
        }
        // User is signed out!
        else {
            // Hide user's profile and sign-out button.
            this.userName.style.display = "none"
            this.userPic.style.display = "none"
            this.signOut.style.display = "none"

            // Show sign-in button.
            this.signIn.style.display = "block"
        }
    }

    // user sign in
    userSignIn(event) {
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new firebase.auth.GoogleAuthProvider()
        this.auth.signInWithPopup(provider).then(result => {
            this.setSnackbar("sign in!")
        })
    }

    // user sign out
    userSignOut() {
        // Sign out of Firebase.
        this.auth.signOut().then(resutl => {
            this.setSnackbar("sign out!")
        })
    }
    /**
     * snackbar
     * @param {string} message 
     * @param {string} type 
     * @param {int} sec 
     */
    setSnackbar(message, type = "info", sec = 2000) {
        this.snackbar.classList.add("active")
        this.snackbar.querySelector(".type").textContent = type
        this.snackbar.querySelector(".message").textContent = message

        Promise.resolve()
            .then(resolve => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        this.snackbar.classList.remove("active")
                        resolve()
                    }, sec)
                })
            })
            .then(() => {
                this.snackbar.querySelector(".type").textContent = ""
                this.snackbar.querySelector(".message").textContent = ""
            })
    }

    /**
     * selector
     * 
     * @param {string} selector 
     */
    selector(selector) {
        return document.querySelector(selector)
    }
}