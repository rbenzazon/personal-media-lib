import React, { createContext } from 'react';
import myData from './data.json';
const {tracks} = myData;

export const PlaylistContext = createContext();



export class PlaylistProvider extends React.Component {

  constructor(props){
    super(props);
    this.getListData = (currentFolder,playLists,searchKeyWord) => {
      let tmpTracks;
      if(props.match.path === "/favorite"){
        tmpTracks = this.mapRecursive(tracks.children).filter((track)=>track.favorite);
      }else if(playLists && props.match.path === "/playlist/:playlistName"){
        for(let playlist of playLists){
          if(props.match.params.playlistName === playlist.title){
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
    this.mapRecursive = (trackList) => {
      let output = [];
      trackList.map((track)=>{
          output.push(track);
          if(track.children){
              output = [...this.mapRecursive(track.children)];
          }
      });
      return output;
    }
    this.state = {
      match:this.props.match,
      currentFolder:tracks,
      loopPlayList:true,
      loopTrack:false,
      parentFolders:[],
      selected:tracks.children.filter(track => !track.children)[0],
      sideDrawer:false,
      favoriteTracks:props.match.path === "/favorite",
      importOpen:false,
      
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
      onPlaylistToAddChange:(value)=>{
        this.setState({playlistToAdd:value});
      },
      onCreatePlaylistOpenClose:(value)=>{
        this.setState({createPlaylistOpen:value});
      },
      onPlaylistNameChange:(name)=>{
        this.setState({createPlaylistName:name});
      },
      createPlaylist:()=>{
        let newPlaylist = {title:this.state.createPlaylistName,children:[]};
        if(this.state.trackToAdd !== null){
          newPlaylist.children.push(this.state.trackToAdd);
        }
        const newPlaylists = [...this.state.playLists,newPlaylist];
        this.setState({playLists:newPlaylists,trackToAdd:null,createPlaylistName:'',createPlaylistOpen:false});
      },
      addToPlaylist:()=>{
        this.state.playlistToAdd.children.push(this.state.trackToAdd);
        let newPlayLists = JSON.parse(JSON.stringify(this.state.playLists))
        //let newPlaylist = {title:this.state.playlistToAdd.title,children:[...this.state.playlistToAdd,[this.state.trackToAdd]]}
        console.log("test")
        //
        this.setState({playLists:newPlayLists,trackToAdd:null,playlistToAdd:null,playlistAddOpen:false});
      },
      onAddToPlaylistClose:()=>{
        this.setState({playlistAddOpen:false});
      },
      onAddToPlaylist:(track)=>{
        this.setState({trackToAdd:track,playlistAddOpen:true});
      },
      onListClick : (track) => {
        if(track === undefined){
          this.state.navigateUp();
        }else if(track.children){
          this.state.navigateToFolder(track);
        }else{
          this.setState({selected:track});
          this.state.restartPlayer();
        }
      },
      navigateToFolder : (track) =>{
        if(track.children){
          this.setState(state => ({
            currentFolder:track,
            parentFolders:[...state.parentFolders,state.currentFolder],
            displayedItems:this.getListData(track)
          }));
        }
      },
      navigateUp : () => {
        let parents = [...this.state.parentFolders];
        const newCurrent = parents.splice(parents.length-1, 1)[0];
        this.setState(state => ({
          currentFolder:newCurrent,
          parentFolders:parents,
          displayedItems:this.getListData(newCurrent)
        }));
      },
      toggleDrawer : (open) => {
        //if(this.state.sideDrawer !== open){

            this.setState({sideDrawer: open});
        //}
      },
      onNextClick : () =>{
        const children = this.state.displayedItems;
        const index = children.indexOf(this.state.selected)+1;
        const boundaries = index === children.length ? 0 : index;
        for(let newIndex = boundaries;newIndex < children.length;newIndex++){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                this.state.restartPlayer();
                return;
            }
        }
      },
      onPrevClick : () =>{
        const children = this.state.displayedItems.filter(track => !track.children);
        const index = children.indexOf(this.state.selected) -1;
        const boundaries = index < 0 ? children.length-1 : index;
        for(let newIndex = boundaries;newIndex >= 0;newIndex--){
            if(!children[newIndex].children){
                this.setState({selected:children[newIndex]});
                this.state.restartPlayer();
                return;
            }
        }
      },
      setPlayerRef: (node) =>{
        if(node !== this.state.playerRef && node !== null){
          this.setState({playerRef:node});
        }
      },
      restartPlayer: () =>{
        if(this.state.playerRef !== undefined){
          this.state.playerRef.load();
          this.state.playerRef.play();
        }
      },
      onAudioEnd: () =>{
        if(this.state.playerRef !== undefined){
          if(this.state.loopPlayList){
            this.state.onNextClick();
          }else if(this.state.loopTrack){
            this.state.restartPlayer();
          }
        }
      },
      toggleLoopStatus:() =>{
        if(this.state.loopPlayList){
          this.setState({loopTrack:true,loopPlayList:false});
        }else if(this.state.loopTrack){
          this.setState({loopTrack:false,loopPlayList:false});
        }else{
          this.setState({loopTrack:false,loopPlayList:true});
        }
      },
      setFavoriteTracks: (value) =>{
        this.setState(state=>({
          favoriteTracks:value,
          displayedItems:this.getListData(state.currentFolder,state.playLists)
        }))
      },
      setImportOpen:(value) =>{
        this.setState({importOpen:value});
      },
      onListFavoriteClick : (track) =>{
        track.favorite = track.favorite ?!track.favorite : true;
        this.setState(state =>({
          displayedItems:this.getListData(state.currentFolder,state.playLists)
        }));
      },
      onSearchKeyPress: (e) => {
        if (e.key === 'Enter') {
          this.state.displaySearch();
        }
      },
      displaySearch:() =>{
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
          this.state.clearSearch();
        }
      },
      onSearchChange: (value) => {
        this.setState(state => ({searchKeyword:value}));
      },
      clearSearch: () => {
        this.setState(state => ({
          searchKeyword:'',
          searchedKeyword:'',
          searchDisplay:false,
          displayedItems:this.getListData(state.currentFolder,state.playLists),
        }));
      },
    };
    this.state.displayedItems=this.getListData(this.state.currentFolder,this.state.playLists);
  }
  
  

  
  
  


  render (){
    return (
      <PlaylistContext.Provider value={this.state}>
        {this.props.children}
      </PlaylistContext.Provider>
    );
  }
}


