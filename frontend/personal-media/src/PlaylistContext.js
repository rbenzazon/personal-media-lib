import React, { createContext } from 'react';
import myData from './data.json';
const {tracks} = myData;

export const PlaylistContext = createContext();

export class PlaylistProvider extends React.Component {
  constructor(props){
    super(props);
    this.getListData = (currentFolder,favoriteTracks,searchKeyWord) => {
      let tmpTracks;
      if(favoriteTracks){
        tmpTracks = this.mapRecursive(tracks.children).filter((track)=>track.favorite);
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
      currentFolder:tracks,
      parentFolders:[],
      selected:tracks.children.filter(track => !track.children)[0],
      sideDrawer:false,
      favoriteTracks:props.match.path === "/favorite",
      importOpen:false,
      displayedItems:this.getListData(tracks,props.match.path === "/favorite"),
      playerRef:undefined,
      searchDisplay:false,
      searchKeyword:'',
      searchedKeyword:'',
      onListClick : (track) => {
        console.log("onListClick");
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
        console.log("navigateToFolder");
        if(track.children){
          this.setState(state => ({
            currentFolder:track,
            parentFolders:[...state.parentFolders,state.currentFolder],
            displayedItems:this.getListData(track,false)
          }));
        }
      },
      navigateUp : () => {
        let parents = [...this.state.parentFolders];
        const newCurrent = parents.splice(parents.length-1, 1)[0];
        this.setState(state => ({
          currentFolder:newCurrent,
          parentFolders:parents,
          displayedItems:this.getListData(newCurrent,false)
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
      setFavoriteTracks: (value) =>{
        this.setState(state=>({
          favoriteTracks:value,
          displayedItems:this.getListData(state.currentFolder,value)
        }))
      },
      setImportOpen:(value) =>{
        this.setState({importOpen:value});
      },
      onListFavoriteClick : (track) =>{
        track.favorite = track.favorite ?!track.favorite : true;
        this.setState(state =>({
          displayedItems:this.getListData(state.currentFolder,state.favoriteTracks)
        }));
      },
      onSearchKeyPress: (e) => {
        if (e.key === 'Enter') {
          console.log('Enter key pressed');
          this.state.displaySearch();
          
          // write your functionality here
        }
      },
      displaySearch:() =>{
        if (this.state.searchKeyword !== '' )
        {
          if(this.state.searchKeyword !== this.state.searchedKeyword){
            this.setState(state => ({
              searchedKeyword:state.searchKeyword,
              searchDisplay:true,
              displayedItems:this.getListData(state.currentFolder,state.favoriteTracks,state.searchKeyword),
            }));
          }
        }else{
          this.state.clearSearch();
        }
      },
      onSearchChange: (value) => {
        this.setState(state => ({searchKeyword:value}));
        console.log('search is '+this.state.searchKeyword);
      },
      clearSearch: () => {
        this.setState(state => ({
          searchKeyword:'',
          searchedKeyword:'',
          searchDisplay:false,
          displayedItems:this.getListData(state.currentFolder,state.favoriteTracks),
        }));
        console.log('clear search');
      },
    };
    //this.setState({displayedItems:,});
  }
  
  

  
  
  


  render (){
    return (
      <PlaylistContext.Provider value={this.state}>
        {this.props.children}
      </PlaylistContext.Provider>
    );
  }
}

