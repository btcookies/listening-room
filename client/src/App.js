import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';

// api wrapper object
const spotifyWebApi = new Spotify();
// vote total that results in a song deleted off the playlist
const DELETE_THRESHOLD = -5;

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();

    this.state = {
      loggedIn: params.access_token ? true : false,
      nowPlaying: {
        name: 'Not Checked',
        image: ''
      },
      playlistId: "7g7QlTHxIdhfIT3EiWMooi", // change this to a playlist you own
      playlistContent: []
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }

    this.getNowPlaying = this.getNowPlaying.bind(this);
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
        if (response.item !== null) {
          this.setState({
            nowPlaying: {
              name: response.item.name,
              image: response.item.album.images[0].url
            }
          })
          spotifyWebApi.getPlaylistTracks(this.state.playlistId).then((object) => {
            object.items.forEach((item) => {
              if (item.track.uri === response.item.uri) {
                this.removeSong(item.track.uri);
              }
            })
          })
        } else {
          this.setState({
            nowPlaying: {
              name: "No Song Currently Playing",
              image: null
            }
          })
        }})}

  // getting list of tracks in a playlist using spotifyWebApi
  refreshSongs() {
    const playlistURI = this.state.playlistId;
    let songsArr = [];
    // get array of playlist song information and store in tmp var songsArr
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

        // delete song if it receives too many downvotes
        for (let i=0; i < songsArr.length; i++) {
          if (songsArr[i].votes <= DELETE_THRESHOLD) {
            songsArr.splice(i,1);
          }
        }

        // loop through sorted songs and reorder playlist in Spotify
        const uriList = songsArr.map((obj) => obj.id);

        console.log("List of URI's to be reordered: ", uriList);
        spotifyWebApi.replaceTracksInPlaylist(this.state.playlistId, uriList);
        // update state
        this.setState((state) => {
          return {
            ...state,
            playlistContent: songsArr
          }
        });

      })

  }

  // adds song to playlist identified in the this.state.playlist.id field
  addSong(uri) {
    console.log("Grabbed song uri: " + uri);
    spotifyWebApi.getPlaylistTracks(this.state.playlistId).then((object) => {
      var x = false;
      object.items.forEach((item) => {
        if (item.track.uri === uri) {
          x = true;
          alert("Song already in playlist!");
        }
      })
      if (x === false) {
        spotifyWebApi.addTracksToPlaylist(this.state.playlistId,[uri])
        .then((object) => this.refreshSongs())
      }
    })
  }

  removeSong(uri) {
    console.log("Grabbed song uri: " + uri);
    spotifyWebApi.removeTracksFromPlaylist(this.state.playlistId,[uri])
    .then((object) => this.refreshSongs())
  }

  choosePlaylist() {
    let input = prompt("Which playlist will be used in this listening room?", "");
    if (input === null) {
      alert("You have inserted an invalid uri. Please try again.");
    } else {
      // playlist uri 22 characters long, follows spotify:user:<userid>:playlist:<uri> struct
      let arr = input.split(':');
      let uri = arr[4];
      console.log("Parsed uri is: ", uri);
      if (uri !== undefined && uri.length === 22) {
        this.setState({ playlistId: uri }, () => this.refreshSongs());
        //this.refreshSongs();
      } else {
        alert("You have inserted an invalid uri. Please try again.");
      }
    }
  }

  componentDidMount() {
    const params = this.getHashParams();
    console.log("Params contains: ", params.access_token);
    console.log("Current access token: ", params.access_token);
    this.refreshSongs();
    setInterval(this.getNowPlaying,1000);
  }

  render() {

    let listSongs = this.state.playlistContent.map((song) =>{
        return(<Router key={song.id}>
          <li>
            <button className="yes" onClick={() =>
              {song.votes++;
              this.refreshSongs();}}>
              upvote
            </button>
            <button className="no" onClick={() =>
              {song.votes--;
              this.refreshSongs();}}>
              downvote
            </button>
            { "     " + song.votes }
            <a href={ song.url }> { song.name + " - " + song.artist }</a>
          </li>
        </Router>)}
      );

    return (
      <body>
      <div className="App">
      <div className="arrange">
        <a href='http://localhost:8888'>
          <button className="login">Login With Spotify</button>
        </a>
        <button className="login" onClick={() => {this.choosePlaylist();}}>Choose Playlist</button>
        </div>
        <div className = "center">Now Playing: { this.state.nowPlaying.name } </div>
        <div className="albumcover">
          <img src= { this.state.nowPlaying.image } style={{width: 160}}/>
        </div>
        <div className="format">
        <form id="searchform" className="example" action="action_page.php" onSubmit= {(e) => {
          e.preventDefault();
          var x = document.getElementById("searchform");
          var text = "";
          var i;
          for (i = 0; i < x.length ;i++) {
              text += x.elements[i].value + " ";
          }
          spotifyWebApi.searchTracks(text).then((object) => {
            if (object.tracks.total !== 0) {
            this.addSong(object.tracks.items[0].uri)
          } else {
            alert("No songs found.");
          }}
        )
        }}>
          <input type="text" placeholder="Enter song name you would like to add...">
          </input>
        </form>
        <div className="content">
        Playlist:
        <ul>
          { listSongs }
        </ul>
        </div>
        </div>
      </div>
      </body>
    );
  }
}

export default App;
