import React from 'react';
import Playlist from './Playlist';
import { Route } from "react-router-dom";


function App() {
  return (
      <React.Fragment>
        <Route exact path='/' render={(props) => <Playlist {...props} />} />
        <Route exact path='/favorite' render={(props) => <Playlist {...props} />} />
      </React.Fragment>
        );
}
export default App;
