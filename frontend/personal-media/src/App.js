import React from 'react';
import FolderLayout from './FolderLayout';
import HomeLayout from './HomeLayout';
import { Route } from "react-router-dom";
import {PlaylistProvider } from './PlaylistContext';


function App(props){

  return (
        <PlaylistProvider >
        <React.Fragment>
          <Route exact path='/' render={(props) => <HomeLayout {...props} />} />
          <Route exact path='/folder/:folderPath' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/folder' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/search/:searchKeyword' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/favorite' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/playlist/:playlistName' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/artist/:artistName' render={(props) => <FolderLayout {...props} />} />
          <Route exact path='/album/:albumName' render={(props) => <FolderLayout {...props} />} />
        </React.Fragment>
        </PlaylistProvider>
        );
  
}

export default App;

