import React, { useEffect, useState, memo } from "react";
import Son from "./Son";

function App() {

    const [id, setId] = useState<string>('');
    useEffect(() => {
        setTimeout(() => {
            setId('1')
        }, 1500);
    }, [])

    return <div>
        <Son id={id} />
        {/* <Son id='22' /> */}
    </div>
}

export default App