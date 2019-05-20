import { Component} from 'react';

export default class Dummy extends Component {
    componentDidMount() {
      this.props.onRouteMount(this.props.match);
    }
    render() {
      return null;
    }
}