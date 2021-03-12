# angular-firebase-kanban

Tutorial about how to get started with Angular and Firebase to build a Kanban board app

## Step 1 - Setup a new project

- Create an Angular application using the CLI
  - `ng new angular-firebase-kanban`
- Create a Firebase project
  - [https://console.firebase.google.com/](https://console.firebase.google.com/)
  - Turn on Google Authentication
  - Create a firestore database
    - Start in test mode Add firebase hosting
- Add Angular Material
  - `ng add @angular/material`
- Add Angular Fire
  - `ng add @angular/fire`
- Deploy to firebase hosting

## Step 2 - Authentication

- Setup Firebase config and AngularFire module
- Add AngularFirestore and AngularFireAuth modules
- Create a shared Material module
  - `ng g m shared/material`
  - Include the `MatButtonModule`
- Create a Authentication module under features
  - `ng g m features/auth --routing`
- Create a login component under the Auth feature
  - `ng g c features/auth/login`
- Make the login component the default route for the app
- Create an Auth Service
  - `ng g s features/auth/services/auth`
  - Add sign-in and sign out functionality
  - Store the user object for use
