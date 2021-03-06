import { Parent } from './Parent.js';

export class Message extends Parent {
    constructor() {

        // parent class
        super();

        // message limit
        this.messageLimit = 12

        // Template for messages.
        this.messageTemplate = `<div class="message">
                <div>
                    <img class="pic">
                    <div class="name"></div>
                    <div class="content"></div>
                </div>
            </div>`

        this.files = null

        // Shortcuts to DOM Elements.
        this.messageList = this.selector("#message-list")
        this.messageInput = this.selector("#message-input")
        this.imageButton = this.selector("#image-button")
        this.imageInput = this.selector("#image-input")
        this.imageOutput = this.selector("#image-output")
        this.send = this.selector("#send")

        // Initiates Firebase auth and listen to auth state changes.
        this.auth.onAuthStateChanged(user => this.authChange(user))

        // image upload.
        this.imageButton.addEventListener("click", event =>
            this.imageInput.click()
        )
        // show tumbnail and set image files
        this.imageInput.addEventListener("change", event => {
            this.showImage(event)
            // FileList object
            this.files = event.target.files
        })

        // Saves text message and image files
        this.send.addEventListener("click", event => {
            // send text message
            this.saveMessage(this.messageInput)

            // if not has files then return
            if (this.files === null) {
                return
            }

            // send image files
            Array.from(this.files).forEach(file => {
                this.saveImageMessage(file)
            })
        })
    }

    // Triggers when the auth state change for instance when the user signs-in or signs-out.
    authChange(user) {
        // User is signed in!
        if (user) {
            // We load currently existing chant messages.
            this.loadMessages()

            // We save the Firebase Messaging Device token and enable notifications.
            this.saveMessagingDeviceToken()
        } else {

        }
    }

    // Loads chat messages history and listens for upcoming ones.
    loadMessages() {

        // Reference to the /messages/ database path.
        this.messageListRef = this.database.collection("messages")

        // event listens for upcoming ones.
        this.messageListRef.orderBy('created', 'asc').limit(this.messageLimit)
            .onSnapshot(
                docs => {
                    this.displayMessage(docs)
                },
                error => {
                    console.log('can not read!');
                    
                }
            )
    }

    // Displays a Message in the UI.
    displayMessage(docs) {
        docs.forEach(doc => {

            // get message element from message id
            let message = this.selector(`#id_${doc.id}`)
            const val = doc.data()

            // If an element for that message does not exists yet we create it.
            if (!message) {
                let container = document.createElement("div")
                container.innerHTML = this.messageTemplate
                message = container.firstChild
                message.setAttribute("id", `id_${doc.id}`)
                this.messageList.appendChild(message)
            }

            // set picture
            message.querySelector(".pic")
                .setAttribute("src", val.photoUrl || "/images/profile_placeholder.png")

            // set name
            message.querySelector(".name").textContent = val.name

            // get content erement
            let messageContent = message.querySelector(".content")

            // If the message is text.
            if (val.text) {
                // Replace all line breaks by <br>.
                messageContent.innerHTML = val.text.replace(/\n/g, "<br>")
            }

            // If the message is an image.
            if (val.imageUrl) {

                // get image from dom
                let image = messageContent.querySelector("img")

                // then not image
                if (!image) {

                    image = document.createElement("img")

                    // add eventlistener image load
                    image.addEventListener('load', event => {

                        this.messageList.scrollTop = this.messageList.scrollHeight;
                    })

                    this.setImageUrl(val.imageUrl, image)
                }

                // then image url is loading image
                if (image && image.getAttribute('src') === this.loadingImageUrl) {

                    this.setImageUrl(val.imageUrl, image)
                }

                // append image to message content
                messageContent.appendChild(image)
            }

            this.messageList.scrollTop = this.messageList.scrollHeight;

            // Show the card fading-in.
            setTimeout(() => {
                message.style.opacity = 1
            }, 10)
        });

        this.messageInput.focus()
    }

    // Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
    setImageUrl(imageUri, imgElement) {
        // If the image is a Cloud Storage URI we fetch the URL.
        if (imageUri.startsWith("gs://")) {
            imgElement.src = this.loadingImageUrl // Display a loading image first.

            this.storage
                .refFromURL(imageUri)
                .getMetadata()
                .then(metadata => {
                    imgElement.src = metadata.downloadURLs[0]
                })
        } else {
            imgElement.src = imageUri
        }
    }

    // Saves the messaging device token to the datastore.
    saveMessagingDeviceToken() {
        firebase.messaging().getToken()
            .then(currentToken => {

                // then there is token
                if (currentToken) {

                    console.log("Got FCM device token:", currentToken)

                    // Saving the Device Token to the datastore.
                    this.database.collection("fcmTokens")
                        .doc(currentToken)
                        .set({ uid: firebase.auth().currentUser.uid })
                } else {
                    // Need to request permissions to show notifications.
                    this.requestNotificationsPermissions()
                }
            })
            .catch(error => {
                this.setSnackbar("Unable to get messaging token.", 'error')
                console.error(error)
            })
    }

    // Requests permissions to show notifications.
    requestNotificationsPermissions() {
        this.setSnackbar("Requesting notifications permission...")
        console.log("Requesting notifications permission...")

        firebase
            .messaging()
            .requestPermission()
            .then(() => {
                // Notification permission granted.
                this.saveMessagingDeviceToken()
            })
            .catch(error => {
                this.setSnackbar("Unable to get permission to notify.", "error")
                console.error(error)
            })
    }

    /*
     * user sign in out
     */

    // Returns true if user is signed-in. Otherwise false and displays a message.
    checkSignedInWithMessage() {
        // Return true if the user is signed in Firebase
        if (this.auth.currentUser) {
            return true
        }

        // Display a message.
        this.setSnackbar(`You must sign-in first`)
        return false
    }

    /*
     * Save message
     */

    // Saves a new message on the Firebase DB.
    saveMessage(element) {
        if (element.value === "") {
            return
        } else if (element.value.trim() === "") {
            return
        }

        // Check that the user entered a message and is signed in.
        if (this.checkSignedInWithMessage()) {
            // get current user
            const currentUser = this.auth.currentUser

            // Add a new message entry to the Firebase Database.
            let data = {
                name: currentUser.displayName,
                text: element.value,
                photoUrl: currentUser.photoURL || "/images/profile_placeholder.png",
                created: new Date(),
            }

            this.messageListRef.add(data)
                .then(docRef => {
                    element.value = ''
                    console.log(docRef)
                    this.setSnackbar("send text message.")
                })
                .catch(error => {
                    this.setSnackbar(
                        "Error writing new message to Firebase Database",
                        "error"
                    )
                    console.error(error)
                })
        }
    }

    showImage(event) {
        // clear image output
        this.imageOutput.innerHTML = ''
        // FileList object
        const files = event.target.files
        Array.from(files).forEach(file => {
            // return not image
            if (!file.type.match("image.*")) {
                return
            }

            this.renderFile(file)
                .then(result => {
                    const img = new Image()
                    img.src = result
                    this.imageOutput.appendChild(img)
                })
                .catch(error => this.setSnackbar(error.message, "error"))
        })
    }

    // Load file
    renderFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onerror = error => {
                reader.abort()
                reject(error)
            }
            reader.onload = event => {
                resolve(event.target.result)
            }
        })
    }

    // Saves a new message containing an image URI in Firebase.
    // This first saves the image in Firebase storage.
    saveImageMessage(file) {
        // Check if the file is an image.
        if (!file.type.match("image.*")) {
            this.setSnackbar(`You can only share images!`)
            return
        }

        // Check if the user is signed-in
        if (this.checkSignedInWithMessage()) {
            // get current user
            var currentUser = this.auth.currentUser

            // Add a message with a loading icon
            let data = {
                name: currentUser.displayName,
                imageUrl: this.loadingImageUrl, // first set loading image
                photoUrl: currentUser.photoURL || "/images/profile_placeholder.png",
                created: new Date(),
            }

            this.messageListRef.add(data)
                .then(docRef => {

                    // Upload the image to Cloud Storage.
                    var filePath = `${currentUser.uid}/${docRef.id}/${file.name}`
                    this.storage
                        .ref(filePath)
                        .put(file)
                        .then(snapshot => {
                            // Get the file's Storage URI and update the chat message placeholder.
                            var fullPath = snapshot.metadata.fullPath

                            // update database imageurl to strage image url
                            docRef.update({
                                imageUrl: this.storage.ref(fullPath).toString()
                            })

                            this.imageOutput.innerHTML = ''
                            this.files = null
                        })
                })
                .catch(error => {
                    tihs.setSnackbar(
                        "There was an error uploading a file to Cloud Storage.",
                        "error"
                    )
                    console.error(error)
                })
        }
    }
}