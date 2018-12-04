# Listening-Room
Web/mobile app that will allow users to add songs through Spotify premium to a singular playlist and then upvote and downvote songs that will then be appropriately moved up and down the queue. The intent is to make music more social.

## Requirements:

1. Web app.
2. Upvote/downvote feature.
3. Limit access with code.
4. If a song receives a certain number of downvotes, it is deleted. 
5. Host can block access.
6. Host ends session.

### Optional:

8. Provide recommended playlists based on people in listening room.
9. Private/public feature. Private: listen remotely to shared playlist. Public: use in context of social gathering.
10. "Winner" for top music recommender. Points system.
11. Multiple people can edit same playlist.

### Run Instructions:

1. Open up terminal and cd into root directory and run 'npm install' in terminal.
2. Now cd into auth-server and run 'node authorization_code/app.js'
3. Open up another terminal tab, cd back into the project directory, then cd into client, and run 'npm start'
4. Visit localhost:3000 and the app should be running! Add songs to the playlist.
