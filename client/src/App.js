import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';
import $ from 'jquery';

const spotifyWebApi = new Spotify();

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
      playlist: []
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
  getPlaylistTracksAPI() {
    this.setState({playlist: []});
    spotifyWebApi.getPlaylistTracks("5tx4WPl98jpQUZ6X19S1Wo")
      .then((response) => {
        response.items.map((object) =>
          this.setState({
            playlist:
            [...this.state.playlist,
              {"songName": object.track.name,
              "url": object.track.external_urls.spotify,
              votes: 0}]
          }))

      })
  }

  // set refresh time for 1 second to keep playlist updated
  componentDidMount() {
    this.interval = setInterval(() => this.getPlaylistTracksAPI(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {

    let listSongs = this.state.playlist.map((song) =>
        <Router key={song.songName}>
          <li>
            <a href={song.url}> { song.songName }</a>
          </li>
        </Router>);

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
        Playlist:
        { listSongs }
        </div>
      </div>
    );
  }
}

export default App;
