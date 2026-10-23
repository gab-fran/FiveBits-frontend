import { useEffect, useState } from 'react';
export function useRemoteList<T>(load: () => Promise<T[]>) {
    const [items, setItems] = useState<T[]>([]);
    const [error, setError] = useState(false);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        load()
            .then((data) => {
                if (active) {
                    setItems(data);
                    setError(false);
                }
            })
            .catch(() => {
                if (active) setError(true);
            });
        return () => {
            active = false;
        };
    }, [load, revision]);
    return {
        items,
        setItems,
        error,
        reload: () => setRevision((value) => value + 1),
    };
}
