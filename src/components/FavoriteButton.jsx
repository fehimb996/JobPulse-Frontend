import { useEffect, useState } from 'react';
import { api } from '@/api/api';
import { Heart, HeartOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavorites, removeFromFavorites, checkIfFavorited } from '@/api/api';

export default function FavoriteButton({ Id }) {
    const handleClick = (e) => {
        e.stopPropagation(); // Prevent card click
        console.log(`Toggled favorite for Id: ${Id}`);
    };

    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        api.get(`/api/favorites/check/${Id}`)
            .then(res => setIsFavorited(res.data.isFavorite))
            .catch(() => setIsFavorited(false));
    }, [Id, isAuthenticated]);

    const toggleFavorite = async (e) => {
        e.stopPropagation(); // prevent card click
        if (!isAuthenticated) return alert('Login required to favorite jobs');

        try {
            if (isFavorited) {
                await api.delete('/api/favorites/remove-from-favorites', { data: [Id] });
                setIsFavorited(false);
            } else {
                await api.post('/api/favorites/add-to-favorites', [Id]);
                setIsFavorited(true);
            }
        } catch (err) {
            console.error('Favorite error', err);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 0,
            }}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                color="red"
                fill={isFavorited ? "red" : "none"}
                stroke={isFavorited ? "none" : "red"}
                size={20}
            />
        </button>
    );
}
