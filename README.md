# Listening-Room
Web/mobile app that will allow users to add songs through Spotify premium to a singular playlist and then upvote and downvote songs that will then be appropriately moved up and down the queue. The intent is to make music more social.

## Requirements:

1. Web app.
2. Multiple people need to be able to add to single playlist.
3. Upvote/downvote feature.
4. Limit access with code.
5. If over half the people downvote a song, it is deleted.
6. Host can block access.
7. Host ends session.

### Optional:

8. Provide recommended playlists based on people in listening room.
9. Private/public feature. Private: listen remotely to shared playlist. Public: use in context of social gathering.
10. "Winner" for top music recommender. Points system. 

### Run Instructions:

1. Open up terminal and cd into root directory and run 'npm install' in terminal.
2. Now cd into auth-server and run 'node authorization_code/app.js'
3. Open up another terminal tab, cd back into the project directory, and run 'npm start'
4. Visit localhost:3000 and the app should be running! Add songs to the playlist.
