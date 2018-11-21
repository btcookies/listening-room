import React, { Component } from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js';

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
      curPlaylist: {
        name: 'No Current Playlist',
        songs: 'unknown'
      },
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
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
  updatePlaylist() {
    let name = prompt("What's the name of the song you are adding?", "");
    
  }
  render() {

    const playlist = [{"songName": "Crew",
                       "embed": <iframe src="https://open.spotify.com/embed/track/15EPc80XuFrb2LmOzGjuRg"
                                        width="300" height="380" frameborder="0"
                                        allowtransparency="true" allow="encrypted-media"></iframe>},
                      {"songName": "Lost In Japan",
                       "embed": <iframe src="https://open.spotify.com/embed/track/79esEXlqqmq0GPz0xQSZTV"
                                        width="300" height="380" frameborder="0"
                                        allowtransparency="true" allow="encrypted-media"></iframe>},
                      {"songName": "1999 WILDFIRE",
                       "embed": <iframe src="https://open.spotify.com/embed/track/1t4pPnbkOjzoA5RvsDjvUU"
                                        width="300" height="380" frameborder="0"
                                        allowtransparency="true" allow="encrypted-media"></iframe>}

                      ];
    const listSongs = playlist.map((song) => <li key={song.name}>{song.embed}</li>);

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
