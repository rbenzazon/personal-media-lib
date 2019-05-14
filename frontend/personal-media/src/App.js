import React from 'react';
import Playlist from './Playlist';
import { Route } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';


function App() {
  return (
      
        <React.Fragment>
          <Route exact path='/' render={(props) => <PlaylistProvider {...props} ><Playlist  /></PlaylistProvider>} />
          <Route exact path='/favorite' render={(props) => <PlaylistProvider {...props} ><Playlist  /></PlaylistProvider>} />
        </React.Fragment>
      
        );
}
export default App;
