# agator9999: A personal music library

## About
agator9999 is a music library that stores your favourite albums from various streaming sources, in one place.

## But why?
It all started when Spotify told me: *"Epic collection, friend. Your library is all filled up. To save more, you'll need to remove some songs."*. Hitting the 'Save' button on an album has a limit: you can save 10 000 songs in your library. I am constantly seeking new music, but I cannot remember all of the artists and albums I listened to, so I use my Spotify library as my music *storage* place. Until now, because it's full. That's why I created agator9999: to have my own *storage* place where there can be albums from Spotify, as well as other streaming sources like Bandcamp.

## What can agator9999 do?

- Browse your artist library
- See your stored albums for a given artist
- Link to the streaming platform for the given album
- Synchronize your Spotify saved albums to agator9999 library (if your Spotify library is not full like mine, you can continue to save your albums and press the Sync button to update agator9999 library).
- Add an album to agator9999 library by providing its Spotify URI

![How the library looks like]('https://github.com/agatheblues/agator9999/tree/master/static/images/library.png')

## What agator9999 does not do?

- Play music. It's a *storage* place. Like a shelf. Shelves don't play music. In the end it's just a nicer, browsable, nicely looking version of library spreadsheet.

## How to use it?
agator9999 is a modest [React](https://reactjs.org/) web application which uses [Firebase](https://firebase.google.com/?authuser=0) as back-end.

1. First, clone the project.
2. Then, to use agator9999, you need to create a Firebase project. Go to the Firebase website, log in / sign in and select `Add Firebase to your web app`: a pop-up with your configuration will appear. Copy the values and replace them in the file `firebase.config.template.json`. Rename the file to `firebase.config.json`.
3. Go to `Database`, select `Real-time Database` and pick the `test` (development) rules. It sets your read and write to public.
4. Then, you need to create your Spotify application: go to the [Developer Dashboard](https://beta.developer.spotify.com/dashboard/login) and hit `Create an app`. You can name your application and select a non-commercial option.
6. Go to `Edit Settings` and set a callback URI for your application. For example, `http://localhost:8888/#/callback`.
7. Go to `spotify.config.template.js` at the root at the project, add the URI to the 'REDIRECT_URI' field and add your Spotify `CLIENT_ID` (that you can get from the Dashboard). Rename the file to `spotify.config.json`.


To run the application, do `node app.js` and `npm start`!

## Disclaimer
This tool has been created for personal use. No artworks are stored in the database, only metadata and links.
