# agator9999: A music albums library

## About
agator9999 is a music library that lists your favourite albums from various streaming sources, in one place. It has a Spotify and a Discogs integration for enriched metadata.

## But why?
It all started when Spotify told me: *"Epic collection, friend. Your library is all filled up. To save more, you'll need to remove some songs."*. Hitting the 'Save' button on an album has a limit: you can save 10 000 songs in your library. I am constantly seeking new music, but I cannot remember all of the artists and albums I listened to, so I use my Spotify library as my music *storage* place. Until now, because it's full. That's why I created agator9999: to have my own *storage* place where there can be albums from Spotify, as well as other streaming sources like Bandcamp.

## What can you do with agator9999?

*Artists*
- View your artist library (Artists are derived from your saved albums.)

*Albums*
- View your saved albums for a given artist
- Synchronize your Spotify saved albums
- Add an album by providing its Spotify URI (listening + metadata) and its Discogs URL (metadata)
- Add an album by providing its Youtube or Bandcamp URL (listening) and its Discogs URL (metadata)
- Improve the default Spotify album metadata by linking an album from Spotify to its Discogs equivalent (at the moment, it adds genres and styles tags).
- Search your artists
- Sort alphabetically and by recently added
- Link to the corresponding listening platform.

*Users*
- Login / Logout of agator9999 via Google Authentication
- Set yourself as admin from the Firebase UI (read+write).


![How the library looks like](https://github.com/agatheblues/agator9999/blob/master/static/images/library.png)
![Artist view like](https://github.com/agatheblues/agator9999/blob/master/static/images/artist.png)

## What agator9999 does not do?

- Play music. It's a *storage* place. Like a shelf. Shelves don't play music. In the end it's just a nicer, browsable, nicely looking version of a library spreadsheet.

## How to use it?
agator9999 is a modest [React](https://reactjs.org/) web application which uses [Firebase](https://firebase.google.com/?authuser=0) as back-end.

*Firebase Setup*
1. First, clone the project.
2. Rename the file to `config.template.json` to `config.js`.
2. Then, to use agator9999, you need to create a Firebase project. Go to the Firebase website, log in / sign in and select `Add Firebase to your web app`: a pop-up with your configuration will appear. Copy the values and replace them in `firebaseConfig` in the file `config.js`.
3. Go to `Database`, select `Real-time Database` and set the `Rules` as follow (temporary):

```
{
  "rules": {
    ".read":"auth != null",
    ".write": "false"
  }
}
```

*Spotify Setup*
4. Then, you need to create your Spotify application: go to the [Developer Dashboard](https://beta.developer.spotify.com/dashboard/login) and hit `Create an app`. You can name your application and select a non-commercial option.
6. Go to `Edit Settings` and set a callback URI for your application. For example, `http://localhost:8888/#/callback`.
7. Go to `config.js` at the root at the project, fill in the `spotifyConfig`: add the URI to the 'REDIRECT_URI' field and add your Spotify `CLIENT_ID` (that you can get from the Dashboard).

*Discogs Setup*
8. Go to [Discogs](https://www.discogs.com/settings/developers) and create your Discogs application.
9. Copy the Consumer key and secret to `discogsConfig` in `config.js`.

*Run the application*
10. To run the application locally:
- Do `node app.js` at the root of the project in a terminal
- Do `npm install` at the root of the project. Then `npm start`!

*Setting your admin rights*
The first time you access agator9999, login with your Google account. You should at this moment only have read access.

11. In the Firebase Authentication Console, go to the `Users` tab.
12. Copy the `User UID` next to your Google account
13. Go to Database > Rules and change them to:

```
{
  "rules": {
    "users": {
      ".read":"auth != null",
      ".write":"root.child('users').child(auth.uid).child('isAdmin').val() == true",
      ".indexOn": ["email"]
    },
    "artists": {
      ".read":"auth != null",
      ".write":"root.child('users').child(auth.uid).child('isAdmin').val() == true"
    },
    "albums": {
    	".read":"auth != null",
      ".write":"root.child('users').child(auth.uid).child('isAdmin').val() == true"
    },
    "secret": {
      ".read":"root.child('users').child(auth.uid).child('isAdmin').val() == true",
      ".write":false
    }
  }
}
```

14. Then go to `Data` and manually add a node at the root of your database as follow:

```
users:
  yourCopiedUID:
    email: "myGoogleEmailAddress@gmail.com",
    isAdmin: true
secrets:
    discogs_secret:  "yourDiscogsSecret"
```

The `isAdmin` tag gives you rights to write to your Firebase database to the given UID. Would you want to have several admins, you can add another user to the list. `".read":"auth != null",` means that any authenticated user has read access to your database. You can of course change the rules settings as you wish (see [documentation](https://firebase.google.com/docs/database/security/)), and for example restrict the read rights to admin only.

## How to deploy it?

Read this: [Firebase Hosting](https://firebase.google.com/docs/hosting/). You can run `npm run build` that will generate your bundle, init a firebase hosting folder, link it to your firebase project and move there `index.html`, `bundle.js`, `style.css` and the `static` folder. Then hit `firebase deploy`!

## Disclaimer
This tool has been created for personal use and not for commercial purposes. No artworks are stored in the database. Also, this is *just* a codebase. You have to setup your own things!

## Feedback
Do you have any feedback? Do you want to contribute to the project? I would be more than happy!

## Kudos
Thanks to [PierreGUI](https://github.com/PierreGUI) & [KtorZ](https://github.com/KtorZ) for their support :heart:!
