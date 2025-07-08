import { useEffect, useState } from "react"

import {
  getSearchQueryParam,
  type SearchQueryParam,
  setSearchQueryParam,
} from "../utils/search-query"

export function useSearchQueryParam(
  paramName: SearchQueryParam,
  initialValue?: string,
) {
  const [state, updateState] = useState(initialValue)
  const updateParam = (value: string) => {
    setSearchQueryParam(paramName, value)
    updateState(value)
  }
  // sync with url query param
  useEffect(() => {
    // if there is already a parameter set on the url
    // override the initial state
    if (getSearchQueryParam(paramName) !== undefined) {
      updateState(getSearchQueryParam(paramName))
      return
    }
    if (initialValue !== undefined) {
      setSearchQueryParam(paramName, initialValue)
    }
  }, [])
  return [state, updateParam] as const
}
