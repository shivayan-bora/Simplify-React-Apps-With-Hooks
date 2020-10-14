import {useContext, useEffect, useReducer, useRef} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'
import isEqual from 'lodash/isEqual'

const Query = ({query, variables, children, normalize = data => data}) => {
  const client = useContext(GitHub.Context)
  
  const [state, setState] = useReducer(
    (state, newState) =>({...state, ...newState}),
    {loaded: false, fetching: false, data: null, error: null}
  )

  useEffect(() =>{
    if(isEqual(previousInputs.current, [query,variables])) {
      return
    }
    setState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        setState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  });

  const previousInputs = useRef()

  useEffect(() => {
    previousInputs.current = [query, variables]
  })

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
