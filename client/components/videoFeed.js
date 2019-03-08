/* eslint-disable complexity */
import React from 'react'
import {connect} from 'react-redux'
// import getUserMedia from 'getusermedia'
// import _ from 'lodash'

var canvas = document.getElementById('image')
var cc = canvas.getContext('2d')

const coinCoords = [
  {x: 0, y: 0},
  {x: 300, y: 0},
  {x: 568, y: 0},
  {x: 0, y: 230},
  {x: 568, y: 230},
  {x: 0, y: 450},
  {x: 568, y: 450}
]

function fastAbs(value) {
  return (value ^ (value >> 31)) - (value >> 31)
}

function differenceAccuracy(target, data1, data2) {
  if (data1.length != data2.length) return null
  var i = 0
  while (i < data1.length * 0.25) {
    var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3
    var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3
    var diff = threshold(fastAbs(average1 - average2))
    target[4 * i] = diff
    target[4 * i + 1] = diff
    target[4 * i + 2] = diff
    target[4 * i + 3] = 0xff
    ++i
  }
}

function threshold(value) {
  return value > 0x15 ? 0xff : 0
}

function pickPositions(num) {
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

class VideoFeed extends React.Component {
  constructor(props) {
    super(props)

    // this.PubSub = props.PubSub || PubSub
    this.blend = this.blend.bind(this)
    this.lastImageData
    this.checkAreas = this.checkAreas.bind(this)
    this.state = {}
  }

  componentDidMount() {
    this.blendedCtx = this.blended.getContext('2d')
    this.canvasCtx = this.canvas.getContext('2d')
    this.canvasCtx.translate(this.canvas.width, 0)
    this.canvasCtx.scale(-1, 1)

    let self = this

    this.video.addEventListener('canplay', this.startVideo.bind(this), false)
  }

  startVideo() {
    this.state.tracker.start(this.video)
    this.drawLoop()
  }

  blend() {
    var width = this.canvas.width
    var height = this.canvas.height
    // get webcam image data
    var sourceData = this.canvasCtx.getImageData(0, 0, width, height)
    // create an image if the previous image doesn’t exist
    if (!this.lastImageData)
      this.lastImageData = this.canvasCtx.getImageData(0, 0, width, height)
    // create a ImageData instance to receive the blended result
    var blendedData = this.canvasCtx.createImageData(width, height)
    // blend the 2 images
    differenceAccuracy(
      blendedData.data,
      sourceData.data,
      this.lastImageData.data
    )
    // draw the result in a canvas
    this.blendedCtx.putImageData(blendedData, 0, 0)
    // store the current webcam image
    this.lastImageData = sourceData
  }

  checkAreas() {
    // loop over the coin areas
    let coinArr = this.props.coinPositions.split('')
    let newPositions = ''
    for (var r = 0; r < coinArr.length; ++r) {
      //get the pixels in a button area from the blended image
      var blendedData = this.blendedCtx.getImageData(
        coinCoords[coinArr[r]].x,
        coinCoords[coinArr[r]].y,
        32,
        32
      )
      var i = 0
      var average = 0
      // loop over the pixels
      while (i < blendedData.data.length / 4) {
        // make an average between the color channel
        average +=
          (blendedData.data[i * 4] +
            blendedData.data[i * 4 + 1] +
            blendedData.data[i * 4 + 2]) /
          3
        ++i
      }
      // calculate an average between the color values of the note area
      average = Math.round(average / (blendedData.data.length / 4))
      // over a small limit, consider that a movement is detected
      if (average > 10) {
        // slice out the touched coin from the positions
        newPositions =
          this.props.coinPositions.slice(
            0,
            this.props.coinPositions.indexOf(coinArr[r])
          ) +
          this.props.coinPositions.slice(
            this.props.coinPositions.indexOf(coinArr[r]) + 1
          )
        //if they have gotten all the coins, make more appear, up until 7
        if (newPositions.length === 0) {
          if (this.props.numberOfCoins < 7) {
            this.props.setNumberCoins(this.props.numberOfCoins + 1)
          }
          newPositions = pickPositions(this.props.numberOfCoins)
        }
      }
    }
  }

  render(props) {
    let className = this.props.matching ? 'matching' : 'notMatching'
    return (
      <div className="player-video">
        <div className="vid-size">
          <video
            className="video-canvas"
            width="600"
            height="480"
            id={this.props.id}
            src={this.props.videoSource}
            autoPlay="true"
            muted
            ref={video => {
              this.video = video
            }}
          />
        </div>

        <canvas
          className="blended"
          width="600px"
          height="480px"
          ref={() => this.blend()}
        />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    gameState: state.roundReducer.gameState,
    matching: state.roundReducer.matching
  }
}

const mapDispatchToProps = dispatch => {
  return {
    toggleCanvasClass: () => {
      dispatch(toggleCanvasClass())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoFeed)
