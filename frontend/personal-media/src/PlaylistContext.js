import React, { createContext } from 'react';
import myData from './data.json';
const {tracks} = myData;

export const PlaylistContext = createContext();



export class PlaylistProvider extends React.Component {
  state = {
    currentFolder:tracks,
    loopPlayList:true,
    loopTrack:false,
    parentFolders:[],
    selected:tracks.children.filter(track => !track.children)[0],
    sideDrawer:false,
    favoriteTracks:this.props.match.path === "/favorite",/**/
    importOpen:false,
    displayedItems:[],
    playerRef:undefined,
    searchDisplay:false,
    searchKeyword:'',
    playLists:[{title:'my playlist',children:[]}],
    searchedKeyword:'',
    trackToAdd:null,
    playlistToAdd:null,
    playlistAddOpen:false,
    createPlaylistOpen:false,
    createPlaylistName:'',
  }
  constructor(props){
    super(props);
    this.getListData = this.getListData.bind(this);
    this.mapRecursive = this.mapRecursive.bind(this);
    this.onPlaylistToAddChange = this.onPlaylistToAddChange.bind(this);
    this.onCreatePlaylistOpenClose = this.onCreatePlaylistOpenClose.bind(this);
    this.onPlaylistNameChange = this.onPlaylistNameChange.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.onAddToPlaylistClose = this.onAddToPlaylistClose.bind(this);
    this.onAddToPlaylist = this.onAddToPlaylist.bind(this);
    this.onListClick = this.onListClick.bind(this);
    this.navigateToFolder = this.navigateToFolder.bind(this);
    this.navigateUp = this.navigateUp.bind(this);
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
    this.displaySearch = this.displaySearch.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    
  }
  componentDidMount(){
    this.setState(state => ({
      displayedItems:this.getListData(state.currentFolder,state.playLists),
    }));
  }
  getListData(currentFolder,playLists,searchKeyWord){
    let tmpTracks;
    if(this.props.match.path === "/favorite"){
      tmpTracks = this.mapRecursive(tracks.children).filter((track)=>track.favorite);
    }else if(playLists && this.props.match.path === "/playlist/:playlistName"){
      for(let playlist of playLists){
        if(this.props.match.params.playlistName === playlist.title){
          tmpTracks = [...playlist.children];
        }
      } 
    }else{
      tmpTracks = [...currentFolder.children];
    }
    if(searchKeyWord && searchKeyWord !== ''){
      tmpTracks = tmpTracks.filter(track=>{
        let result = false;
        let searchableFields = track.children ? ['title'] : ['title','artist','album'];
        for(let prop of searchableFields){
          result = result || track[prop].search(new RegExp(searchKeyWord, "i")) !== -1;
        }
        return result;
      });
    }
    return tmpTracks;
  }
  mapRecursive(trackList){
    let output = [];
    trackList.map((track)=>{
        output.push(track);
        if(track.children){
            output = [...this.mapRecursive(track.children)];
        }
    });
    return output;
  }
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
    let newPlayLists = JSON.parse(JSON.stringify(this.state.playLists))
    //let newPlaylist = {title:this.state.playlistToAdd.title,children:[...this.state.playlistToAdd,[this.state.trackToAdd]]}
    console.log("test")
    //
    this.setState({playLists:newPlayLists,trackToAdd:null,playlistToAdd:null,playlistAddOpen:false});
  }
  onAddToPlaylistClose(){
    this.setState({playlistAddOpen:false});
  }
  onAddToPlaylist(track){
    this.setState({trackToAdd:track,playlistAddOpen:true});
  }
  onListClick(track){
    if(track === undefined){
      this.navigateUp();
    }else if(track.children){
      this.navigateToFolder(track);
    }else{
      this.setState({selected:track});
      this.restartPlayer();
    }
  }
  navigateToFolder(track){
    if(track.children){
      this.setState(state => ({
        currentFolder:track,
        parentFolders:[...state.parentFolders,state.currentFolder],
        displayedItems:this.getListData(track)
      }));
    }
  }
  navigateUp(){
    let parents = [...this.state.parentFolders];
    const newCurrent = parents.splice(parents.length-1, 1)[0];
    this.setState(state => ({
      currentFolder:newCurrent,
      parentFolders:parents,
      displayedItems:this.getListData(newCurrent)
    }));
  }
  toggleDrawer(open){
    //if(this.state.sideDrawer !== open){

        this.setState({sideDrawer: open});
    //}
  }
  onNextClick(){
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
  setPlayerRef(node){
    if(node !== this.state.playerRef && node !== null){
      this.setState({playerRef:node});
    }
  }
  restartPlayer(){
    if(this.state.playerRef !== undefined){
      this.state.playerRef.load();
      this.state.playerRef.play();
    }
  }
  onAudioEnd(){
    if(this.state.playerRef !== undefined){
      if(this.state.loopPlayList){
        this.onNextClick();
      }else if(this.state.loopTrack){
        this.restartPlayer();
      }
    }
  }
  toggleLoopStatus(){
    if(this.state.loopPlayList){
      this.setState({loopTrack:true,loopPlayList:false});
    }else if(this.state.loopTrack){
      this.setState({loopTrack:false,loopPlayList:false});
    }else{
      this.setState({loopTrack:false,loopPlayList:true});
    }
  }
  setFavoriteTracks(value){
    this.setState(state=>({
      favoriteTracks:value,
      displayedItems:this.getListData(state.currentFolder,state.playLists)
    }))
  }
  setImportOpen(value){
    this.setState({importOpen:value});
  }
  onListFavoriteClick(track){
    track.favorite = track.favorite ?!track.favorite : true;
    this.setState(state =>({
      displayedItems:this.getListData(state.currentFolder,state.playLists)
    }));
  }
  onSearchKeyPress(e){
    if (e.key === 'Enter') {
      this.displaySearch();
    }
  }
  displaySearch(){
    if (this.state.searchKeyword !== '' )
    {
      if(this.state.searchKeyword !== this.state.searchedKeyword){
        this.setState(state => ({
          searchedKeyword:state.searchKeyword,
          searchDisplay:true,
          displayedItems:this.getListData(state.currentFolder,state.playLists,state.searchKeyword),
        }));
      }
    }else{
      this.clearSearch();
    }
  }
  onSearchChange(value){
    this.setState(state => ({searchKeyword:value}));
  }
  clearSearch() {
    this.setState(state => ({
      searchKeyword:'',
      searchedKeyword:'',
      searchDisplay:false,
      displayedItems:this.getListData(state.currentFolder,state.playLists),
    }));
  }

  

  
  
  


  render (){
    return (
      <PlaylistContext.Provider value={{
        state:this.state,
        getListData:this.getListData,
        mapRecursive:this.mapRecursive,
        onPlaylistToAddChange:this.onPlaylistToAddChange,
        onCreatePlaylistOpenClose:this.onCreatePlaylistOpenClose,
        onPlaylistNameChange:this.onPlaylistNameChange,
        createPlaylist:this.createPlaylist,
        addToPlaylist:this.addToPlaylist,
        onAddToPlaylistClose:this.onAddToPlaylistClose,
        onAddToPlaylist:this.onAddToPlaylist,
        onListClick:this.onListClick,
        navigateToFolder:this.navigateToFolder,
        navigateUp:this.navigateUp,
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
        displaySearch:this.displaySearch,
        onSearchChange:this.onSearchChange,
        clearSearch:this.clearSearch,
        }}>
        {this.props.children}
      </PlaylistContext.Provider>
    );
  }
}

