//Initial State
const initialState = {
  rounds: 0,
  numberOfCoins: 1,
  coinPositions: '',
  opponentCoinPositions: '',
  gameState: null,
  targetEmotion: '',
  matching: false,
  score: 0,
  opponentScore: 0,
  count: 0,
  interval: 0,
  blackout: false,
  emotions: ['angry', 'happy', 'sad', 'surprised']
}

//ACTIONS
const SET_ROUNDS = 'SET_ROUNDS';
const DECREMENT_ROUNDS = "DECREMENT ROUNDS";
const CHECK_ROUND = "CHECK_ROUND";
const INCREMENT_SCORE = "INCREMENT_SCORE";
const DECREASE_SCORE = "DECREASE_SCORE";
const SET_USER_SCORE = "SET_USER_SCORE";
const SET_OPPONENT_SCORE = "SET_OPPONENT_SCORE";
const SET_NUMBER_COINS = "SET_NUMBER_COINS";
const SET_COINS = "SET_COINS";
const SET_OPPONENT_COINS = "SET_OPPONENT_COINS";
const CREATE_INTERVAL = "CREATE_INTERVAL";
const DESTROY_INTERVAL = "DESTROY_INTERVAL";
const SET_EMOTION = "SET_EMOTION";
const SET_GAME_STATE = "SET_GAME_STATE";
const TOGGLE_CANVAS_CLASS = "TOGGLE_CANVAS_CLASS";
const BLACKOUT_SCREEN = "BLACKOUT_SCREEN";
const REVIVE_SCREEN = "REVIVE_SCREEN";

//ACTION CREATORS
export function setRounds(num){
  return {type: SET_ROUNDS, rounds: num}
}

export function decrementRound(num){
  return {type: DECREMENT_ROUNDS, rounds: num}
}

export function checkRound(){
  return {type: CHECK_ROUND}
}

export function incrementScore(){
  return {type: INCREMENT_SCORE}
}

export function decreaseScore(num){
  return {type: DECREASE_SCORE, num: num}
}

export function setUserScore(num){
  return {type: SET_USER_SCORE, num: num}
}

export function setOpponentScore(opponentScore){
  return {type: SET_OPPONENT_SCORE, opponentScore:opponentScore}
}

export function setNumberCoins(num){
  return {type: SET_NUMBER_COINS, numberOfCoins: num}
}

export function setCoins(positions){
  return {type: SET_COINS, coinPositions: positions}
}

export function setOpponentCoins(positions){
  return {type: SET_OPPONENT_COINS, coinPositions: positions}
}

export function setEmotion(emotion){
  return {type: SET_EMOTION, targetEmotion: emotion}
}

export function createInterval(interval){
  return {type: CREATE_INTERVAL, interval: interval}
}

export function destroyInterval(){
  return {type: DESTROY_INTERVAL}
}

export function setGameState(state){
  return {type: SET_GAME_STATE, state: state}
}

export function toggleCanvasClass(){
  return {type: TOGGLE_CANVAS_CLASS}
}

export function blackoutScreen() {
  return {type: BLACKOUT_SCREEN}
}

export function reviveScreen() {
  return {type: REVIVE_SCREEN}
}

//Reducer
const reducer = function(state = initialState, action){
    switch(action.type){
      case SET_ROUNDS:
        return Object.assign({}, state, {rounds : action.rounds});
      case DECREMENT_ROUNDS:
        return Object.assign({}, state, {rounds: state.rounds-1});
      case CHECK_ROUND:
        return state.rounds
      case INCREMENT_SCORE:
        return Object.assign({}, state, {score: state.score+1})
      case DECREASE_SCORE:
        return Object.assign({}, state, {score: state.score-action.num})
      case SET_USER_SCORE:
        return Object.assign({}, state, {score: action.num}) 
      case SET_OPPONENT_SCORE:
        return Object.assign({}, state, {opponentScore:action.opponentScore})
      case SET_NUMBER_COINS:
        return Object.assign({}, state, {numberOfCoins: action.numberOfCoins})
      case SET_COINS:
        return Object.assign({}, state, {coinPositions: action.coinPositions})
      case SET_OPPONENT_COINS:
        return Object.assign({}, state, {opponentCoinPositions: action.coinPositions})
      case SET_EMOTION:
        return Object.assign({}, state, {targetEmotion: action.targetEmotion})
      case CREATE_INTERVAL:
        return Object.assign({}, state, {interval: action.interval})
      case DESTROY_INTERVAL: 
        return Object.assign({}, state, {interval: 0})
      case SET_GAME_STATE:
        return Object.assign({}, state, {gameState: action.state})
      case TOGGLE_CANVAS_CLASS:
        return Object.assign({}, state, {matching: !state.matching})
      case BLACKOUT_SCREEN:
        return Object.assign({}, state, {blackout: true})
      case REVIVE_SCREEN:
        return Object.assign({}, state, {blackout: false})
      default:
        return state;
    }
}

export default reducer
