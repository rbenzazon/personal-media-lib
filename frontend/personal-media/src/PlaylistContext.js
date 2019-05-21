import React, { createContext } from 'react';
import myData from './data.json';
import Player from './AudioPlayer/utils/constants';
import constants from './ContextConstant'
const {tracks} = myData;


export const PlaylistContext = createContext();

export class PlaylistProvider extends React.Component {
  state = {
    route:null,
    currentFolder:tracks,
    parentFolders:[],
    selected:tracks.children.filter(track=>!track.children)[0],
    displayedItemMode:constants.PLAYLIST_MODE,
    displayedItems:[],
    playLists:[{title:'my playlist',children:[]}],
    playerLoopStatus:Player.Status.LOOP_LIST,
    playerStatus:Player.Status.PAUSE,
    playerRef:undefined,
    sideDrawer:false,
    importOpen:false,
    searchOpen:false,
    createPlaylistOpen:false,
    searchKeyword:'',
    trackToAdd:null,
    playlistToAdd:null,
    playlistAddOpen:false,
    createPlaylistName:'',
  }
  constructor(props){
    super(props);
    this.mapRecursive = this.mapRecursive.bind(this);
    this.onPlaylistToAddChange = this.onPlaylistToAddChange.bind(this);
    this.onCreatePlaylistOpenClose = this.onCreatePlaylistOpenClose.bind(this);
    this.onPlaylistNameChange = this.onPlaylistNameChange.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.onAddToPlaylistClose = this.onAddToPlaylistClose.bind(this);
    this.onAddToPlaylist = this.onAddToPlaylist.bind(this);
    this.onListClick = this.onListClick.bind(this);
    /*this.navigateToFolder = this.navigateToFolder.bind(this);
    this.navigateUp = this.navigateUp.bind(this);*/
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.setPlayerRef = this.setPlayerRef.bind(this);
    this.restartPlayer = this.restartPlayer.bind(this);
    this.onAudioEnd = this.onAudioEnd.bind(this);
    this.toggleLoopStatus = this.toggleLoopStatus.bind(this);
    this.setFavoriteTracks = this.setFavoriteTracks.bind(this);
    this.setImportOpen = this.setImportOpen.bind(this);
    this.onListFavoriteClick = this.onListFavoriteClick.bind(this);
    this.onSearchKeyPress = this.onSearchKeyPress.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.onSearchOpen = this.onSearchOpen.bind(this)
    this.onRouteMount = this.onRouteMount.bind(this);
    this.getPlaylistRef = this.getPlaylistRef.bind(this);
    this.playRandomTrack = this.playRandomTrack.bind(this);
    this.getParentPath = this.getParentPath.bind(this);
    this.getFolderPath = this.getFolderPath.bind(this);
    this.linkTo = this.linkTo.bind(this);
    this.getAllTracks = this.getAllTracks.bind(this);
    this.getAllTrackPropValues = this.getAllTrackPropValues.bind(this);
    
  }

  
  /**
   * Playlists
   * 
   */
  onPlaylistToAddChange(value){
    this.setState({playlistToAdd:value});
  }
  onCreatePlaylistOpenClose(value){
    this.setState({createPlaylistOpen:value});
  }
  onPlaylistNameChange(name){
    this.setState({createPlaylistName:name});
  }
  createPlaylist(){
    let newPlaylist = {title:this.state.createPlaylistName,children:[]};
    if(this.state.trackToAdd !== null){
      newPlaylist.children.push(this.state.trackToAdd);
    }
    const newPlaylists = [...this.state.playLists,newPlaylist];
    this.setState({playLists:newPlaylists,trackToAdd:null,createPlaylistName:'',createPlaylistOpen:false});
  }
  addToPlaylist(){
    this.state.playlistToAdd.children.push(this.state.trackToAdd);
    let newPlayLists = [...this.state.playLists];
    //let newPlaylist = {title:this.state.playlistToAdd.title,children:[...this.state.playlistToAdd,[this.state.trackToAdd]]}
    this.setState({playLists:newPlayLists,trackToAdd:null,playlistToAdd:null,playlistAddOpen:false});
  }
  onAddToPlaylistClose(){
    this.setState({playlistAddOpen:false});
  }
  onAddToPlaylist(track){
    this.setState({trackToAdd:track,playlistAddOpen:true});
  }
  /**
   * file list nav
   */
  onListClick(track){
    if(track && !track.children){
      this.setState({selected:track});
      this.restartPlayer();
    }
  }

  toggleDrawer(open){
    //if(this.state.sideDrawer !== open){

        this.setState({sideDrawer: open});
    //}
  }
  /**
   * Playback
   */
  setPlayerRef(node){
    if(node !== this.state.playerRef && node !== null){
      this.setState({playerRef:node});
    }
  }
  onNextClick(){
    if(this.state.playerLoopStatus == Player.Status.RANDOM){
      this.playRandomTrack();
    }else{
      const children = this.state.displayedItems;
      const index = children.indexOf(this.state.selected)+1;
      const boundaries = index === children.length ? 0 : index;
      for(let newIndex = boundaries;newIndex < children.length;newIndex++){
          if(!children[newIndex].children){
              this.setState({selected:children[newIndex]});
              this.restartPlayer();
              return;
          }
      }
    }
  }
  onPrevClick(){
    const children = this.state.displayedItems.filter(track => !track.children);
    const index = children.indexOf(this.state.selected) -1;
    const boundaries = index < 0 ? children.length-1 : index;
    for(let newIndex = boundaries;newIndex >= 0;newIndex--){
        if(!children[newIndex].children){
            this.setState({selected:children[newIndex]});
            this.restartPlayer();
            return;
        }
    }
  }
  playRandomTrack(){
    const children = this.state.displayedItems.filter(track=>track !== this.state.selected && !track.children);
    let randomIndex = Math.round(Math.random()*(children.length-1));
    let newTrack = children[randomIndex];
    this.setState({selected:newTrack});
    this.restartPlayer();
  }
  restartPlayer(){
    if(this.state.playerRef !== undefined){
      this.state.playerRef.load();
      this.state.playerRef.play();
    }
  }
  onAudioEnd(){
    if(this.state.playerRef !== undefined){
      switch(this.state.playerLoopStatus){
        case Player.Status.LOOP_LIST :
          this.onNextClick();
        break;
        case Player.Status.LOOP_TRACK :
          this.restartPlayer();
        break;
        case Player.Status.RANDOM :
          this.playRandomTrack();
        break;
      }
    }
  }
  toggleLoopStatus(){
    let newLoopStatus;
    switch(this.state.playerLoopStatus){
      case Player.Status.LOOP_LIST :
        newLoopStatus = Player.Status.LOOP_TRACK;
      break;
      case Player.Status.LOOP_TRACK :
        newLoopStatus = Player.Status.NO_LOOP;
      break;
      case Player.Status.NO_LOOP :
        newLoopStatus = Player.Status.RANDOM;
      break;
      case Player.Status.RANDOM :
        newLoopStatus = Player.Status.LOOP_LIST;
      break;
    }
    this.setState({playerLoopStatus:newLoopStatus});
  }

  /**
   * Favorite
   */
  setFavoriteTracks(value){
    this.setState(state=>({
      favoriteTracks:value,
      displayedItems:[...state.displayedItems],
    }))
  }
  setImportOpen(value){
    this.setState({importOpen:value});
  }
  onListFavoriteClick(track){
    track.favorite = track.favorite ?!track.favorite : true;
    this.setState(state =>({
      displayedItems:[...state.displayedItems],
    }));
  }
  /**
   * Search
   * 
   */
  onSearchOpen(value){
    this.setState({searchOpen:value,searchKeyword:''});
  }
  onSearchKeyPress(e){
    if (e.key === 'Enter') {
      this.state.route.history.push("/search/"+this.state.searchKeyword);
    }
  }
  onSearchChange(value){
    this.setState(state => ({searchKeyword:value}));
  }
  clearSearch() {
    if(this.state.route.match.params.searchKeyword && this.state.displayedItemMode === constants.SEARCH_MODE){
      this.state.route.history.push("/folder");
      this.setState(state => ({
        searchKeyword:'',
        searchOpen:false,
      }));
    }
    
  }

  /**
   * Init / route event
   * 
   */
  onRouteMount(route){
    const match = route.match;
    let newTracks;
    let newMode;
    let newTitle;
    let currentMatch = match? match:this.state.route;
    switch(currentMatch.path){
      case "/" :
        newTracks = [...tracks.children];
        newMode = null;
        newTitle = "Home";
      break;
      case "/"+constants.FAVORITE_MODE :
        newTracks = this.mapRecursive(tracks.children).filter((track)=>track.favorite);
        newMode = constants.FAVORITE_MODE;
        newTitle = "Favorite";
      break;
      case "/"+constants.PLAYLIST_MODE+"/:playlistName" :
        const playListRef = this.getPlaylistRef(currentMatch.params.playlistName,this.state.playLists);
        newTracks = [...playListRef.children];
        newMode = constants.PLAYLIST_MODE;
        newTitle = playListRef.title;
      break;
      case "/"+constants.FOLDER_MODE+"/*" :
        const folderStructure = this.getFolderStructure(currentMatch.params[0]);
        newTracks = [...folderStructure.newFolder.children];
        newMode = constants.FOLDER_MODE;
        newTitle = folderStructure.newFolder.title;
        this.setState(state => ({
          displayedItemMode:newMode,
          route:route,
          displayedItems:newTracks,
          title:newTitle,
          parentFolders:folderStructure.parentFolders,
        }));
        return;//special case, don't wanna share the setState with other cases to add parent parentFolders
      break;
      case "/"+constants.FOLDER_MODE+"/" :
      case "/"+constants.FOLDER_MODE :
        newTracks = [...tracks.children];
        newMode = constants.FOLDER_MODE;
        newTitle = tracks.title;
        this.setState(state => ({
          displayedItemMode:newMode,
          route:route,
          displayedItems:newTracks,
          title:newTitle,
          parentFolders:[],
        }));
        return;//special case, don't wanna share the setState with other cases to add parent parentFolders
      break;
      case "/"+constants.SEARCH_MODE+"/:searchKeyword" :
        let searchKeyword = currentMatch.params.searchKeyword;
        newTracks = this.mapRecursive(tracks.children).filter(track=>{
          let result = false;
          let searchableFields = track.children ? ['title'] : ['title','artist','album'];
          for(let prop of searchableFields){
            result = result || track[prop] && track[prop].search(new RegExp(searchKeyword, "i")) !== -1;
          }
          return result;
        });
        newMode = constants.SEARCH_MODE;
        newTitle = "";
      break;
      case "/"+constants.ARTIST_MODE+"/:artistName" :
        let artistName = decodeURIComponent(currentMatch.params.artistName);
        newTracks = this.getAllTracks({artist:artistName}).artist;
        newMode = constants.ARTIST_MODE;
        newTitle = "artist : "+artistName;
      break;
      case "/"+constants.ALBUM_MODE+"/:albumName" :
        let albumName = decodeURIComponent(currentMatch.params.albumName);
        newTracks = this.getAllTracks({album:albumName}).album;
        newMode = constants.ALBUM_MODE;
        newTitle = "album : "+albumName;
      break;
      case "/"+constants.GENRE_MODE+"/:genreName" :
        let genreName = decodeURIComponent(currentMatch.params.genreName);
        newTracks = this.getAllTracks({genre:genreName}).genre;
        newMode = constants.GENRE_MODE;
        newTitle = "genre : "+genreName;
      break;
    }
    const selected = newTracks.length>0?newTracks[0]:tracks.children[0];
    this.setState(state => ({
      //selected:selected,
      displayedItemMode:newMode,
      route:route,
      displayedItems:newTracks,
      title:newTitle,
    }));
  }
  getAllTracks(props){
    const allTracks = this.mapRecursive(tracks.children).filter(track=>!track.children);
    if(props.album || props.artist || props.genre){
      let result = {};
      for(let prop in props){
        let propValueMap = {};
        allTracks.map(track=>{
          if(track[prop]){
            if(propValueMap[track[prop]]){
              propValueMap[track[prop]].push(track);
            }else{
              propValueMap[track[prop]] = [track];
            }
          }
        });
        let propResultList = [];
        if(propValueMap[props[prop]]){
          result[prop] = propValueMap[props[prop]];
        }
      }
      return result;
    }else{
      return allTracks;
    }
  }
  getAllTrackPropValues(prop){
    const allTracks = this.mapRecursive(tracks.children).filter(track=>!track.children && track[prop]);
    if(prop === "album" || prop === "artist" || prop === "genre"){
      let result = {};
      let propValueMap = {};
      allTracks.map(track=>{
          propValueMap[track[prop]] = true;
      });
      let propResultList = [];
      for(let propValue in propValueMap){
        propResultList.push(propValue);
      }
      return propResultList;
    }else{
      return null;
    }
  }
  getPlaylistRef(name,playLists){
    for(let playlist of playLists){
      if(name === playlist.title){
        return playlist;
      }
    }
    return false;
  }
  getParentPath(){
    return "/folder/"+this.state.parentFolders.slice(1).map(folder=>folder.title).join("/");
  }
  getFolderPath(track){
    let parents = [];
    if(this.state.parentFolders.length === 1){
      parents = [this.state.parentFolders[0].children.filter(track=>track.title == this.state.title)[0]];
    }else if(this.state.parentFolders.length > 1){

      parents = [...this.state.parentFolders.slice(1),this.state.parentFolders[this.state.parentFolders.length-1].children.filter(track=>track.title == this.state.title)];
    }
    let parentFolderNames = parents.map(folder=>folder.title);
    let parentFolderReduced = parentFolderNames.reduce((concat,prev,idx)=>concat +prev+"/","");
    return "/folder/"+parentFolderReduced+track.title;
  }
  getFolderStructure(path){
    const folders = path.split("/");
    
    //route /folder/
    if(folders.length == 0){
      return {newFolder:tracks,parentFolders:[]};
    }
    /*if(folders[folders.length-1] === ""){
      folders.length = folders.length-1;
    }*/
    //route folder/folderPath
    //TODO check for slash support in url param
    let parentFolders = [tracks];
    let newFolder = tracks;
    for(let folder of folders){
      let tmpTracks = newFolder.children.filter(track=>track.children && track.title === folder);
      //no folder found with the corresponding name
      if(tmpTracks.length == 0){
        console.log("can't find "+folder+" in "+newFolder.title)
        return {newFolder:tracks,parentFolders:[]};
      }
      newFolder = tmpTracks[0];
      if(folders.indexOf(folder) < folders.length -1){
        parentFolders.push(newFolder);
      }
    }
    return {newFolder:newFolder,parentFolders:parentFolders};
  }

  mapRecursive(trackList){
    let output = [];
    trackList.map((track)=>{
        if(!track.children){
          output.push(track);
        }else{
          output = [...output,...this.mapRecursive(track.children)];
        }
    });
    return output;
  }

  linkTo(route){
    this.state.route.history.push(route);
  }

  render (){
    return (
      <PlaylistContext.Provider value={{
        state:this.state,
        onPlaylistToAddChange:this.onPlaylistToAddChange,
        onCreatePlaylistOpenClose:this.onCreatePlaylistOpenClose,
        onPlaylistNameChange:this.onPlaylistNameChange,
        createPlaylist:this.createPlaylist,
        addToPlaylist:this.addToPlaylist,
        onAddToPlaylistClose:this.onAddToPlaylistClose,
        onAddToPlaylist:this.onAddToPlaylist,
        onListClick:this.onListClick,
        toggleDrawer:this.toggleDrawer,
        onNextClick:this.onNextClick,
        onPrevClick:this.onPrevClick,
        setPlayerRef:this.setPlayerRef,
        restartPlayer:this.restartPlayer,
        onAudioEnd:this.onAudioEnd,
        toggleLoopStatus:this.toggleLoopStatus,
        setFavoriteTracks:this.setFavoriteTracks,
        setImportOpen:this.setImportOpen,
        onListFavoriteClick:this.onListFavoriteClick,
        onSearchKeyPress:this.onSearchKeyPress,
        onSearchChange:this.onSearchChange,
        clearSearch:this.clearSearch,
        onRouteMount:this.onRouteMount,
        onSearchOpen:this.onSearchOpen,
        getParentPath:this.getParentPath,
        getFolderPath:this.getFolderPath,
        getAllTracks:this.getAllTracks,
        linkTo:this.linkTo,
        getAllTrackPropValues:this.getAllTrackPropValues,
        }}>
        {this.props.children}
      </PlaylistContext.Provider>
    );
  }
}


