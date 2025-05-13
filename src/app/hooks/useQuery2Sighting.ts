import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const useQuery2Sighting = () => {
    const [id, setId] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const sightingId = searchParams.get('id');
        if (sightingId) {
            setId(sightingId);
        } else {
            setId(null);
        }
    }, [searchParams]);

    return id;
};
