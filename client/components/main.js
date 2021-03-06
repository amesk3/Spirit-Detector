import React, {Component} from 'react'

import {connect} from 'react-redux'

import store, {
//   collectCoin,
  setGameState,
  //   setNumberCoins,
  setCoins,
  //   setEmotion,
  setRounds
  //   decrementRound,
  //   createInterval,
  //   destroyInterval,
  //   setOpponentScore,
  //   blackoutScreen,
  //   reviveScreen,
  //   decreaseScore,
  //   setUserScore
} from '../store'
import VideoFeed from './videoFeed'

class Main extends Component {
  constructor(props) {
    super(props)
    var video = document.getElementById('video')
    // this.pc = null;
    this.isInitiator = false

    this.state = {
      // pc: {},
      videoSource: video
      // userMediaObject: {}
    }

    this.handleVideoSource = this.handleVideoSource.bind(this)
    // this.pickPositions = this.pickPositions.bind(this)
    this.startGame = this.startGame.bind(this)
    this.runGame = this.runGame.bind(this)
  }

  componentDidMount() {
    console.log('hitting component did mount')
    let videoSource
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.oGetUserMedia

    navigator.mediaDevices.getUserMedia(
      {video: true, audio: true},
      this.handleVideoSource,
      this.videoError
    )
  }

  // window.addEventListener('keyup', this.handleSpacebar, false)

  handleVideoSource(mediaStream) {
    this.setState({
      videoSource: (video.srcObject = mediaStream),
      userMediaObject: mediaStream
    })
  }

  videoError() {}

  startGame(rounds) {
    // this.props.setUserScore(0)
    // this.props.setOpponentScore(0);
    this.props.setGameState('active')
    this.props.setEmotion(this.selectRandomEmotion())
    // socket.emit('newEmotion', this.props.targetEmotion, this.state.roomName);
    let coinString = this.pickPositions(this.props.numberOfCoins)
    this.props.setCoins(coinString)
    this.props.setRounds(rounds)
    let interval = setInterval(this.runGame, 5000)
    this.props.createInterval(interval)
  }

  runGame() {
    if (this.props.rounds > 1) {
      console.log('interval', this.props.interval)
      this.props.setNumberCoins(1)
      // this.props.setEmotion(this.selectRandomEmotion());
      // socket.emit('newEmotion', this.props.targetEmotion, this.state.roomName);
      this.props.setCoins(this.pickPositions(this.props.numberOfCoins))
      this.props.decrementRound()
    } else {
      clearInterval(this.props.interval)
      this.props.setNumberCoins(1)
      this.props.setCoins('')
      this.props.setGameState('stopped')
    }
  }

  pickPositions(num) {
    let positions = ''
    let possiblePositions = [0, 1, 2, 3, 4, 5, 6]
    for (let i = 0; i < num; i++) {
      positions += possiblePositions.splice(
        Math.floor(Math.random() * possiblePositions.length),
        1
      )[0]
    }
    return positions
  }

  render() {
    console.log(this.props.match.coinPositions, ' this.props.coinpositions')
    return (
      <div>
        <VideoFeed
          videoSource={this.state.userVidSource}
          coinPositions={this.coinPositions}
        />
        <video src={this.state.videoSource} autoPlay="true" />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    gameState: state.roundReducer.gameState,
    positions: state.roundReducer.coinPositions,
    numberOfCoins: state.roundReducer.numberOfCoins,
    rounds: state.roundReducer.rounds
  }
}

const mapDispatchToProps = dispatch => {
  return {
    // setNumberCoins: num => {
    //   dispatch(setNumberCoins(num))
    // },
    setCoins: pos => {
      dispatch(setCoins(pos))
    },
    // setEmotion: emotion => {
    //   dispatch(setEmotion(emotion))
    // },
    setRounds: rounds => {
      dispatch(setRounds(rounds))
    },
    // decrementRound: () => {
    //   dispatch(decrementRound())
    // },
    // createInterval: interval => {
    //   dispatch(createInterval(interval))
    // },
    // destroyInterval: () => {
    //   dispatch(destroyInterval())
    // },
    setGameState: gameState => {
      dispatch(setGameState(gameState))
    }
    // setOpponentScore: (user, score) => {
    //   dispatch(setOpponentScore(score))
    // },
    // blackoutScreen: () => {
    //   dispatch(blackoutScreen())
    // },
    // reviveScreen: () => {
    //   dispatch(reviveScreen())
    // },
    // decreaseScore: num => {
    //   dispatch(decreaseScore(num))
    // },
    // setUserScore: num => {
    //   dispatch(setUserScore(num))
    // }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
