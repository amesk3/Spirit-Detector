import React, {Component} from 'react'
import {Router} from 'react-router'
import {Route, Switch} from 'react-router-dom'
import {connect} from 'react-redux'
import history from './history'
import Main from './components/main'
import videoFeed from './components/videoFeed'
import {me} from './store/user'

class Routes extends Component {
  componentDidMount() {
    this.props.me()
  }
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/main" component={Main} />
          <Route exact path="/videoFeed" component={videoFeed} />
        </Switch>
      </Router>
    )
  }
}

const mapState = state => {
  return {}
}

const mapDispatch = {
  me
}

export default connect(mapState, mapDispatch)(Routes)
