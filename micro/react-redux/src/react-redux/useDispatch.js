import { useContext } from "react";
import ReduxContext from "./ReduxContext";

function useDispatch() {
    const context = useContext(ReduxContext)
    const { store } = context
    return store.dispatch
}

export default useDispatch