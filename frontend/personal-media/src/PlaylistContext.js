import React, { useState,createContext } from 'react';
import myData from './data.json';
const {tracks} = myData;

export const PlaylistContext = createContext();

export class PlaylistProvider extends React.Component {
  constructor(props){
    super(props);
    this.getListData = (currentFolder,favoriteTracks) => {
      if(favoriteTracks){
          return this.mapRecursive(tracks.children).filter((track)=>track.favorite);
      }else{
          return [...currentFolder.children];
      }
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
      favoriteTracks:props.match.path == "/favorite",
      importOpen:false,
      displayedItems:this.getListData(tracks,props.match.path == "/favorite"),
      playerRef:undefined,
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
          this.setState(state => ({currentFolder:track,parentFolders:[...state.parentFolders,state.currentFolder],displayedItems:this.getListData(track,false)}));
        }
      },
      navigateUp : () => {
        let parents = [...this.state.parentFolders];
        const newCurrent = parents.splice(parents.length-1, 1)[0];
        this.setState(state => ({currentFolder:newCurrent,parentFolders:parents,displayedItems:this.getListData(newCurrent,false)}));
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
        if(node != this.state.playerRef && node != null){
          this.setState({playerRef:node});
        }
      },
      restartPlayer: () =>{
        if(this.state.playerRef != undefined){
          this.state.playerRef.load();
          this.state.playerRef.play();
        }
      },
      setFavoriteTracks: (value) =>{
        this.setState(state=>({favoriteTracks:value,displayedItems:this.getListData(state.currentFolder,value)}))
      },
      setImportOpen:(value) =>{
        this.setState({importOpen:value});
      },
      onListFavoriteClick : (track) =>{
        track.favorite = track.favorite ?!track.favorite : true;
        this.setState(state =>({displayedItems:this.getListData(state.currentFolder,state.favoriteTracks)}));
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

