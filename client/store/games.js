import axios from 'axios'

const initialState = []

const GET_GAMES = 'GET_GAMES'

const getGames = games => {
  return {type: GET_GAMES, games}
}

export const getGameStats = () => dispatch =>
  axios
    .get('/api/users/games')
    .then(res => res.data)
    .then(games => dispatch(getGames(games)))
    .catch(console.log)

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_GAMES:
      return action.games
    default:
      return state
  }
}
