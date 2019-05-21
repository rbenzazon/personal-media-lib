import { Component} from 'react';

export default class Dummy extends Component {
    componentDidMount() {
      this.props.onRouteMount(this.props.match);
    }
    componentWillReceiveProps(nextProps, nextState){
      if(nextProps.match.match != this.props.match.match){
        this.props.onRouteMount(nextProps.match);
      }
    }
    render() {
      return null;
    }
}