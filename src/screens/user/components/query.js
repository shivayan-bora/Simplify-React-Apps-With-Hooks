import {useContext, useEffect, useReducer, useRef} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'
import isEqual from 'lodash/isEqual'

function useSetState(initialState) {
  const [state, setState] = useReducer(
    (state, newState) =>({...state, ...newState}),
    initialState,
  )
  
  return [state, setState]
}

function useSafeSetState(initialState) {
  const [state, setState] = useSetState(initialState)
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => mountedRef.current= false
  }, [])
  
  const safeSetState = (...args) => mountedRef.current && setState(...args)

  return [state, safeSetState]
}

function usePrevious(value) {
    const ref = useRef()
  
    useEffect(() => {
      ref.current = value
    })

    return ref.current
}

const Query = ({query, variables, children, normalize = data => data}) => {
  const client = useContext(GitHub.Context)
  const [state, safeSetState] = useSafeSetState({loaded: false, fetching: false, data: null, error: null});


  useEffect(() =>{
    if(isEqual(previousInputs, [query,variables])) {
      return
    }
    safeSetState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        safeSetState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  });

  const previousInputs = usePrevious([query, variables])

  return children(state)
}

Query.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
}

export default Query
