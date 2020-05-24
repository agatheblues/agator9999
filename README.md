# agator9999: A music library

## About
agator9999 is a music library that lists your favourite albums and artists from various streaming sources, in one place (Spotify, Youtube, Bandcamp, and Discogs).

## But why?
It all started when Spotify told me: *"Epic collection, friend. Your library is all filled up. To save more, you'll need to remove some songs."*. Hitting the 'Save' button on an album has a limit: you can save upt to 10 000 songs in your library. I am constantly seeking new music, but I cannot remember all of the artists and albums I listened to, so I used my Spotify album library as a *storage* place. Until now, because it's full. That's why I created agator9999: to have my own *storage* place where there can be albums from Spotify, as well as other streaming sources.

## Demo

[OLD DEMO](https://agator9999-demo.firebaseapp.com) 🔥🔥🔥

This is the `v1.0.0` demo, back when the backend was supplied by Firebase. The base features are the same in `v2.0.0`. In the demo, *everyone* is an admin. In your agator9999 instance, you would set only yourself as admin. 


## What can you do with agator9999?

**Artists**
- View your artist library
- Merge a duplicate artist into one (Artists might come from different sources like Spotify or Discogs)
- Unmerge an artist sources
- Remove an artist (available when no albums are attached anymore)

**Albums**
- View your saved albums for a given artist
- Synchronize your Spotify saved albums
- Add an album by providing its Spotify URI (listening + metadata) and its Discogs URL (metadata)
- Add an album by providing its Youtube or Bandcamp URL (listening) and its Discogs URL (metadata)
- Improve the default Spotify album metadata by linking an album from Spotify to its Discogs equivalent (at the moment, it adds genres and styles tags).
- Search your artists
- Sort alphabetically and by recently added
- Link to the corresponding listening platform.
- Remove an album

**Users**
- As an admin, you can confirm new user's accounts

Once an artist has both a Spotify and a Discogs source (after a merge, for example), all the upcoming albums you might add to this artist will be attached to this artist.

![Library view](https://github.com/agatheblues/agator9999/blob/master/static/images/library.png)
![Artist view](https://github.com/agatheblues/agator9999/blob/master/static/images/artist.png)

## What agator9999 does not do?

- Play music. It's a *storage* place. Like a shelf. Shelves don't play music.

## How to use it?

agator9999 is a React web application. The backend is powered by a Postgres database, and a Ruby on rails API, called [apigator9999](https://github.com/agatheblues/apigator9999).

**Setup**

1. First, clone the project.
2. Rename the file to `config.template.json` to `config.js`. You can change the `owner` name in `config.js` to customize the login page.

**Spotify Setup**

3. Then, you need to create your Spotify application: go to the [Developer Dashboard](https://beta.developer.spotify.com/dashboard/login) and hit `Create an app`. You can name your application and select a non-commercial option.
4. Go to `Edit Settings` and set a callback URI for your application. For example, `http://localhost:8888/#/callback`. The callback URL is used to login to Spotify.
5. Go to `config.js` at the root at the project, fill in the `spotifyConfig` with the same callback URI in 'REDIRECT_URI' and add your Spotify `CLIENT_ID` (that you can get from the Dashboard).

**Discogs Setup**

6. Go to [Discogs](https://www.discogs.com/settings/developers) and create your Discogs application. You don't need to fill the callback URL.
7. Copy the Consumer key and secret in `discogsConfig` in `config.js`.

**Run the application**

8. To run the application locally:
- Do `npm install` at the root of the project.
- Open another terminal window, and do `npm start` at the root of the project.
- Check out http://localhost:8888/ !

**Backend Setup**

Follow the instructions at [apigator9999](https://github.com/agatheblues/apigator9999). Update `config.js` by filling in the database URL in `databaseConfig`.


## How to deploy it?

When you deploy the application, remember to update the Spotify callback URI in your config, and in the Spotify application settings.

Note: some adblockers might be blocking your calls to the Spotify or Discogs API.

## Disclaimer
This tool has been created for personal use and not for commercial purposes. No artworks are stored in the database.

## Kudos
Thanks to [PierreGUI](https://github.com/PierreGUI) & [KtorZ](https://github.com/KtorZ) for their support :heart:!
