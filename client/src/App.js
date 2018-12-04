import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';


const spotifyWebApi = new Spotify();

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();

    let curSongs = [];
    // get songs from playlist

    this.state = {
      loggedIn: params.access_token ? true : false,
      nowPlaying: {
        name: 'Not Checked',
        image: ''
      },
      playlistId: "4gwYTkpnORezJqVgfVZ5Dx", // change this to a playlist you own
      playlistContent: []
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }

  // get spotify credential params to prove premium access
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  // gets the currently playing song title and image for display on
  // front page
  getNowPlaying() {
    spotifyWebApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            image: response.item.album.images[0].url
          }
        })
      })
  }

  // getting list of tracks in a playlist using spotifyWebApi
  refreshSongs() {
    const playlistURI = this.state.playlistId;
    let newState = Object.assign({}, this.state);
    let songsArr = [];
    //this.setState({playlist: { id: playlistURI, content: []}});
    spotifyWebApi.getPlaylistTracks(playlistURI)
      .then((response) => {
        response.items.map((object) =>
          songsArr.push({"id": object.track.uri,
                          "name": object.track.name,
                          "artist": object.track.artists[0].name,
                          "url": object.track.external_urls.spotify,
                          "votes": 0})
        );
        // get old vote count so we don't overwrite on the refresh
        this.state.playlistContent.forEach(function(oldObj) {
          songsArr.forEach(function(newObj) {
            if (oldObj.id === newObj.id) {
              newObj.votes = oldObj.votes;
              return;
            }
          })
        });
        // sort songs by number of votes
        songsArr.sort((a,b) => b.votes - a.votes);
        // loop through sorted songs and reorder playlist in Spotify

        this.setState((state) => {
          return {
            ...state,
            playlistContent: songsArr
          }
        });
        const uriList = songsArr.map((obj) => obj.id);

        console.log("List of URI's to be reordered: ", uriList);
        spotifyWebApi.replaceTracksInPlaylist(this.state.playlistId, uriList);
      })

  }

  // adds song to playlist identified in the this.state.playlist.id field
  addSong(uri) {
    console.log("Grabbed song uri: " + uri);
    spotifyWebApi.addTracksToPlaylist(this.state.playlistId,[uri])
    .then((object) => this.refreshSongs())
  }

  removeSong(uri) {
    console.log("Grabbed song uri: " + uri);
    spotifyWebApi.removeTracksFromPlaylist(this.state.playlistId,[uri])
    .then((object) => this.refreshSongs())
  }

  // removes song from playlist identified in the this.state.playlist.id field
  //removeSong() {
  //  const songURI = prompt("What song would you like to remove? Paste the uri here.", "");
  //  if (songURI === null) {
  //    alert("Sorry, you did not input a valid uri. Please try again.");
  //  } else {
  //    console.log("Grabbed song uri: " + songURI);
  //    spotifyWebApi.removeTracksFromPlaylist(this.state.playlistId, [songURI])
  //    .then((object) => this.refreshSongs())
  //  }
  //}

  componentDidMount() {
    const params = this.getHashParams();
    console.log("Current access token: ", params.access_token);
    this.refreshSongs();
  }

  render() {

    let listSongs = this.state.playlistContent.map((song) =>{
        return(<Router key={song.id}>
          <li>
            <a href={ song.url }> { song.name + " - " + song.artist }</a>
            { "     " + song.votes }
            <button onClick={() =>
              {song.votes++;
              this.refreshSongs();}}>
              upvote
            </button>
            <button onClick={() =>
              {song.votes--;
              this.refreshSongs();}}>
              downvote
            </button>
          </li>
        </Router>)}
      );

    return (
      <div className="App">
        <a href='http://localhost:8888'>
          <button>Login With Spotify</button>
        </a>
        <div>Now Playing: { this.state.nowPlaying.name } </div>
        <div>
          <img src= { this.state.nowPlaying.image } style={{width: 100}}/>
        </div>
        <button onClick={() => this.getNowPlaying()}>
          Check Now Playing
        </button>
        <div>
        <form id="searchform" className="example" action="action_page.php">
          <input type="text" placeholder="Enter song name you would like to add or remove...">
          </input>
        </form>
        <div>
        <button onClick= {() => {
          var x = document.getElementById("searchform");
          var text = "";
          var i;
          for (i = 0; i < x.length ;i++) {
              text += x.elements[i].value + " ";
          }
          spotifyWebApi.searchTracks(text).then((object) =>
            this.addSong(object.tracks.items[0].uri)
        )
        }}>Add Song</button>
        <button onClick= {() => {
          var x = document.getElementById("searchform");
          var text = "";
          var i;
          for (i = 0; i < x.length ;i++) {
              text += x.elements[i].value + " ";
          }
          spotifyWebApi.searchTracks(text).then((object) =>
            this.removeSong(object.tracks.items[0].uri)
        )
      }}>Remove Song</button>
        </div>
        Playlist:
        <ul>
          { listSongs }
        </ul>
        </div>
      </div>
    );
  }
}

export default App;
