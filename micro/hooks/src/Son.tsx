import React, { useEffect } from "react";
import { useRequest } from "ahooks";

import { getDetailById } from "./services";

function Son({ id }: { id: string }) {

    const { loading, data, run } = useRequest(getDetailById, { manual: true });

    console.log('-------');
    console.log('id: ', id, ', loading: ', loading, ', data: ', data);
    useEffect(() => {
        if (!id) return
        run(id)
    }, [id])


    return <div>
        {!id ? 'no id' : loading ? 'loading...' : data}
    </div>
}

export default Son