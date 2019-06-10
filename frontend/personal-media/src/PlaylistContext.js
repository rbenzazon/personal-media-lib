import React, { createContext } from 'react';
//import myData from './data.json';
import Player from './AudioPlayer/utils/constants';
import constants from './ContextConstant';
//const {tracks} = myData;

/**
 * theaudiodb.com art data
 * key
 * 195003 
 */
export const PlaylistContext = createContext();

export class PlaylistProvider extends React.Component {
  state = {
    route:null,
    currentFolder:null,
    favorites:{},
    artists:[],
    albums:[],
    genres:[],
    parentFolders:[],
    selected:null,
    displayedItemMode:constants.PLAYLIST_MODE,
    displayedItems:[],
    playLists:[],
    
    playerLoopStatus:Player.Status.LOOP_LIST,
    playerStatus:Player.Status.PAUSE,
    playerRef:undefined,

    sideDrawerOpen:false,
    importOpen:false,
    searchOpen:false,
    createPlaylistOpen:false,
    playlistAddOpen:false,
    loginOpen:false,
    createUserOpen:false,

    trackToAdd:null,
    
    loggedIn:false,
    loginName:'',
    loginType:null,
  }
  constructor(props){
    super(props);
    
    this.openCreatePlaylist = this.openCreatePlaylist.bind(this);
    this.onCreatePlaylistSuccess = this.onCreatePlaylistSuccess.bind(this);
    
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.closeAddToPlaylist = this.closeAddToPlaylist.bind(this);
    this.onAddToPlaylist = this.onAddToPlaylist.bind(this);

    this.onListClick = this.onListClick.bind(this);
    /*this.navigateToFolder = this.navigateToFolder.bind(this);
    this.navigateUp = this.navigateUp.bind(this);*/
    this.openDrawer = this.openDrawer.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.setPlayerRef = this.setPlayerRef.bind(this);
    this.restartPlayer = this.restartPlayer.bind(this);
    this.onAudioEnd = this.onAudioEnd.bind(this);
    this.toggleLoopStatus = this.toggleLoopStatus.bind(this);
    this.openImport = this.openImport.bind(this);
    this.onListFavoriteClick = this.onListFavoriteClick.bind(this);
    this.onRouteMount = this.onRouteMount.bind(this);
    this.playRandomTrack = this.playRandomTrack.bind(this);
    this.getParentPath = this.getParentPath.bind(this);
    this.getFolderPath = this.getFolderPath.bind(this);
    this.linkTo = this.linkTo.bind(this);
    this.displaySearch = this.displaySearch.bind(this);
    this.openLogin = this.openLogin.bind(this);
    this.onLoggedIn = this.onLoggedIn.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
    this.openCreateUser = this.openCreateUser.bind(this);
    this.onHomeRoute = this.onHomeRoute.bind(this);
    this.onFavoriteRoute = this.onFavoriteRoute.bind(this);
    this.isFavorite = this.isFavorite.bind(this);
    this.refreshFavorite = this.refreshFavorite.bind(this);
    this.refreshPlaylists = this.refreshPlaylists.bind(this);
    this.loadArtists = this.loadArtists.bind(this);
    this.loadAlbums = this.loadAlbums.bind(this);
    this.loadGenres = this.loadGenres.bind(this);
    this.isRoute = this.isRoute.bind(this);

    this.checkLogin();
  }

  isRoute(route){
    if(!this.state.route) return false;
    switch(this.state.route.match.path){
      case "/" :
        return route === this.state.route.match.path;
      case "/"+constants.FAVORITE_MODE :
        return route === this.state.route.match.path;
      case "/"+constants.PLAYLIST_MODE+"/:playlistName" :
        const currentUrl = "/"+constants.PLAYLIST_MODE+"/"+this.state.route.match.params.playlistName;
        if(currentUrl === route){
          console.log("same");
          console.log("route "+route);
        }
        return currentUrl === route;
      case "/"+constants.FOLDER_MODE+"/*" :
        return route.includes("/"+constants.FOLDER_MODE);
      case "/"+constants.FOLDER_MODE+"/" :
      case "/"+constants.FOLDER_MODE :
        return route.includes("/"+constants.FOLDER_MODE);
      default:
        return false;
    }
  }
  async loadArtists(){
    const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getArtistList', {
        crossDomain:true,
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    
    if(!res.ok){
        return;
    }else{
        const jsonBody = await res.json();
        this.setState({artists:jsonBody.sort((a,b)=>a<b?-1:1)});
    }
  }
  async loadAlbums(){
      const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getAlbumList', {
          crossDomain:true,
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
      });
      if(!res.ok){
          return;
      }else{
          const jsonBody = await res.json();
          this.setState({albums:jsonBody.sort((a,b)=>a<b?-1:1)});
      }
  }
  async loadGenres(){
      const res = await fetch(process.env.REACT_APP_SERV_URL+'api/getGenreList', {
          crossDomain:true,
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
      });
      if(!res.ok){
          return;
      }else{
          const jsonBody = await res.json();
          this.setState({genres:jsonBody.sort((a,b)=>a<b?-1:1)});
      }
  }

  openCreateUser(value){
    this.setState({createUserOpen:value});
  }

  async checkLogin(){
    const url = process.env.REACT_APP_SERV_URL+"api/user/checkLogin";
    const options = {
      method: 'POST',
      crossDomain:true,
      credentials:'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
    const res = await fetch(url,options);
    if(res.status >=400) {
      console.log("toto");
      return;
    }
    const user = await res.json();
    if(user.name === null){
        return;
    }
    this.onLoggedIn(user.name,user.type);
  }

  isFavorite(fileId){
    return this.state.favorites[fileId];
  }

  async refreshFavorite(){
    const config = {
      method: 'POST',
      credentials:'include',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({fileListName:"favorite",})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getFileListIds",config);
    if(!res.ok) return;
    const fileList = await res.json();
    this.setState({favorites:fileList.files.reduce(this.reduceFavoriteToHashmap,{})});
  }

  reduceFavoriteToHashmap(map, obj) {
      map[obj] = true;
      return map;
  }
  
  async refreshPlaylists(){
    const config = {
      method: 'POST',
      credentials:'include',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getFileListList",config);
    if(!res.ok) return;
    const filesListList = await res.json();
    this.setState({playLists:filesListList.files.map((filesList)=>{return {title:filesList.name}})});
  }

  async onLoggedIn(name,type){
    
    await this.refreshFavorite();
    await this.refreshPlaylists();
    if(this.state.albums.length === 0){
      await this.loadArtists();
      await this.loadAlbums();
      await this.loadGenres();
    }
    
    if(name !== undefined){
      this.setState({loggedIn:true,loginName:name,loginType:type,loginOpen:false});
    }else{
      this.setState({loggedIn:false,loginName:'',loginType:null});
    }
  }
  getCookieValue(a) {
    var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
  /**
   * Playlists
   * 
   */
  
  openCreatePlaylist(value){
    this.setState({createPlaylistOpen:value});
  }
  
  async openLogin(value){
    if(value && this.state.loggedIn){
      const res = await fetch(process.env.REACT_APP_SERV_URL+'api/user/logoff', {
          method: 'POST'
      });
      this.setState({loggedIn:false,loginName:''});
    }else{
      this.setState({loginOpen:value});
    }
  }
  async onCreatePlaylistSuccess(createPlaylistName){
    this.openCreatePlaylist(false);
    await this.refreshPlaylists();
    this.linkTo("/playlist/"+createPlaylistName);
  }
  async addToPlaylist(playlistToAdd){
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({fileListName:playlistToAdd.title,fileId:this.state.trackToAdd._id})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/addToFileList",config);
    const fileList = await res.json();
    if(!fileList.files){
      return;
    }
    this.setState({trackToAdd:null,playlistAddOpen:false});
  }
  /**
   * closes the add to playlist dialog
   */
  closeAddToPlaylist(){
    this.setState({playlistAddOpen:false});
  }
  /**
   * stores which track has been clicked to open the add playlist dialog
   */
  onAddToPlaylist(track){
    this.setState({trackToAdd:track,playlistAddOpen:true});
  }
  /**
   * file list nav
   */
  onListClick(track){
    if(track && track.url){
      this.setState({selected:track});
      this.restartPlayer();
    }
  }

  openDrawer(open){
    this.setState({sideDrawerOpen: open});
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
    if(this.state.playerLoopStatus === Player.Status.RANDOM){
      this.playRandomTrack();
    }else{
      const children = this.state.displayedItems;
      const index = children.indexOf(this.state.selected)+1;
      const boundaries = index === children.length ? 0 : index;
      for(let newIndex = boundaries;newIndex < children.length;newIndex++){
          if(children[newIndex].url){
              this.setState({selected:children[newIndex]});
              this.restartPlayer();
              return;
          }
      }
    }
  }
  onPrevClick(){
    const children = this.state.displayedItems.filter(track => track.url);
    const index = children.indexOf(this.state.selected) -1;
    const boundaries = index < 0 ? children.length-1 : index;
    for(let newIndex = boundaries;newIndex >= 0;newIndex--){
        if(children[newIndex].url){
            this.setState({selected:children[newIndex]});
            this.restartPlayer();
            return;
        }
    }
  }
  playRandomTrack(){
    const children = this.state.displayedItems.filter(track=>track !== this.state.selected && track.url);
    if(children.length === 0){
      return;
    }
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
        default:
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
      default:
      break;
    }
    this.setState({playerLoopStatus:newLoopStatus});
  }

  openImport(value){
    this.setState({importOpen:value});
  }
  async onListFavoriteClick(track){
    //track.favorite = track.favorite ?!track.favorite : true;
    if(this.isFavorite(track._id)){
      const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({fileListName:"favorite",fileId:track._id})
      }
      const res = await fetch(process.env.REACT_APP_SERV_URL+"api/removeFromFileList",config);
      const fileList = await res.json();
      if(!fileList.files){
        return;
      }
      this.setState(state =>({
        favorites:fileList.files.reduce(this.reduceFavoriteToHashmap,{}),
      }));
    }else{
      const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({fileListName:"favorite",fileId:track._id})
      }
      const res = await fetch(process.env.REACT_APP_SERV_URL+"api/addToFileList",config);
      const fileList = await res.json();
      if(!fileList.files){
        return;
      }
      this.setState(state =>({
        favorites:fileList.files.reduce(this.reduceFavoriteToHashmap,{}),
      }));
    }
    
  }

  /**
   * Search
   * 
   */
  
  displaySearch(searchKeyword){
    if(searchKeyword != ''){
      this.state.route.history.push("/search/"+searchKeyword);
    }
  }

  /**
   * Routes
   * 
   */

  /**
   * @route current route object to save in the state
   * @match optional, match contains matching parameters from the route,
   * if not passed, root folder should be received
   */
  
  onHomeRoute(route,match){
    this.setState(state => ({
      route:route,
      title:"Home",
      displayedItems:[],
      parentFolders:[],
    }));
  }
  async onFavoriteRoute(route,match){
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({fileListName:"favorite",})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getFileList",config);
    const fileList = await res.json();
    if(fileList[0] === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.FAVORITE_MODE,
      route:route,
      displayedItems:fileList.files,
      title:"Favorite",
      parentFolders:[],
    }));
  }
  async onPlaylistRoute(route,match){
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({fileListName:match.params.playlistName,})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getFileList",config);
    const fileList = await res.json();
    if(fileList.files === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.FAVORITE_MODE,
      route:route,
      displayedItems:fileList.files.sort(this.sortDisplayedItems),
      title:match.params.playlistName,
      parentFolders:[],
    }));
  }

  sortDisplayedItems(a,b) {
    if(!a.url && b.url){//folder up
        return -1;
    }else if(a.url && !b.url){//files down
        return 1;
    }else if(!a.url && !b.url ){//folder sort
        return a.title < b.title ? -1 : 1;
    }else if(a.url && b.url){//file sort
        return a.title < b.title ? -1 : 1;
    }
  } 
  
  async onFolderRoute(route,match){
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({path:match?match.params[0]:""})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getFolder",config);
    const fileList = await res.json();
    if(fileList.title === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.FOLDER_MODE,
      route:route,
      displayedItems:fileList.children.sort(this.sortDisplayedItems),
      title:fileList.title,
      parentFolders:fileList.parents.concat([{_id:fileList._id,title:fileList.title}]),
    }));
  }

  async onSearchRoute(route,match){
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({searchKeyword:match.params.searchKeyword})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getSearch",config);
    const fileList = await res.json();
    if(fileList[0] === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.SEARCH_MODE,
      route:route,
      displayedItems:fileList.sort(this.sortDisplayedItems),
      title:match.params.searchKeyword,
      parentFolders:[],
    }));
  }

  async onArtistRoute(route,match){
    const artistName = decodeURIComponent(match.params.artistName);
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({artistName:artistName})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getArtist",config);
    const fileList = await res.json();
    if(fileList.files === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.ARTIST_MODE,
      route:route,
      displayedItems:fileList.files.sort(this.sortDisplayedItems),
      title:artistName,
      parentFolders:[],
    }));
  }
  
  async onAlbumRoute(route,match){
    const albumName = decodeURIComponent(match.params.albumName);
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({albumName:albumName})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getAlbum",config);
    const fileList = await res.json();
    if(fileList.files === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.ALBUM_MODE,
      route:route,
      displayedItems:fileList.files.sort(this.sortDisplayedItems),
      title:albumName,
      parentFolders:[],
    }));
  }
  
  async onGenreRoute(route,match){
    const genreName = decodeURIComponent(match.params.genreName);
    const config = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({genreName:genreName})
    }
    const res = await fetch(process.env.REACT_APP_SERV_URL+"api/getGenre",config);
    const fileList = await res.json();
    if(fileList.files === null){
      return;
    }
    this.setState(state => ({
      displayedItemMode:constants.ALBUM_MODE,
      route:route,
      displayedItems:fileList.files.sort(this.sortDisplayedItems),
      title:genreName,
      parentFolders:[],
    }));
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
        return this.onHomeRoute(route,currentMatch);
      case "/"+constants.FAVORITE_MODE :
        return this.onFavoriteRoute(route,currentMatch);
      case "/"+constants.PLAYLIST_MODE+"/:playlistName" :
        return this.onPlaylistRoute(route,currentMatch);
      case "/"+constants.FOLDER_MODE+"/*" :
        return this.onFolderRoute(route,currentMatch);
      case "/"+constants.FOLDER_MODE+"/" :
      case "/"+constants.FOLDER_MODE :
        return this.onFolderRoute(route);
      case "/"+constants.SEARCH_MODE+"/:searchKeyword" :
        return this.onSearchRoute(route,currentMatch);
      case "/"+constants.ARTIST_MODE+"/:artistName" :
        return this.onArtistRoute(route,currentMatch);
      case "/"+constants.ALBUM_MODE+"/:albumName" :
        return this.onAlbumRoute(route,currentMatch);
      case "/"+constants.GENRE_MODE+"/:genreName" :
        return this.onGenreRoute(route,currentMatch);
      default:
      break;
    }
  }

  getParentPath(){
    return "/folder/"+this.state.parentFolders.slice(1,-1).map(folder=>folder.title).join("/");
  }
  getFolderPath(track){
    let parentFolderNames = this.state.parentFolders.slice(1).map(folder=>folder.title);
    let parentFolderReduced = parentFolderNames.reduce((concat,prev,idx)=>concat +prev+"/","");
    return "/folder/"+parentFolderReduced+track.title;
  }

  linkTo(route){
    this.state.route.history.push(route);
  }

  render (){
    return (
      <PlaylistContext.Provider value={{
        state:this.state,
        openCreatePlaylist:this.openCreatePlaylist,
        onCreatePlaylistSuccess:this.onCreatePlaylistSuccess,
        addToPlaylist:this.addToPlaylist,
        closeAddToPlaylist:this.closeAddToPlaylist,
        onAddToPlaylist:this.onAddToPlaylist,
        onListClick:this.onListClick,
        openDrawer:this.openDrawer,
        onNextClick:this.onNextClick,
        onPrevClick:this.onPrevClick,
        setPlayerRef:this.setPlayerRef,
        restartPlayer:this.restartPlayer,
        onAudioEnd:this.onAudioEnd,
        toggleLoopStatus:this.toggleLoopStatus,
        openImport:this.openImport,
        onListFavoriteClick:this.onListFavoriteClick,
        onRouteMount:this.onRouteMount,
        getParentPath:this.getParentPath,
        getFolderPath:this.getFolderPath,
        linkTo:this.linkTo,
        displaySearch:this.displaySearch,
        openLogin:this.openLogin,
        onLoggedIn:this.onLoggedIn,
        openCreateUser:this.openCreateUser,
        isFavorite:this.isFavorite,
        isRoute:this.isRoute,
        }}>
        {this.props.children}
      </PlaylistContext.Provider>
    );
  }
}


