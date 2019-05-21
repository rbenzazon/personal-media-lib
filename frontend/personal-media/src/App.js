import React from 'react';
import FolderLayout from './FolderLayout';
import HomeLayout from './HomeLayout';
import { Route,Switch } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';
import APAppBar from './APAppBar';
import PLAppBar from './PLAppBar';

function App(props){

  return (
        <PlaylistProvider >
        <React.Fragment>
          <PLAppBar />
          <Switch>
          <Route exact path='/' render={(props) => <HomeLayout {...props} />} />
          <Route exact strict path={[
            "/folder",
            "/folder/",
            '/search/:searchKeyword',
            '/favorite',
            '/playlist/:playlistName',
            '/artist/:artistName',
            '/album/:albumName',
            '/genre/:genreName'
            ]} render={(props) => <FolderLayout {...props} />} />
          
          <Route exact strict path='/folder/*' render={(props) => <FolderLayout {...props} />} />
          </Switch>
          <APAppBar />
        </React.Fragment>
        </PlaylistProvider>
        );
  
}

export default App;

