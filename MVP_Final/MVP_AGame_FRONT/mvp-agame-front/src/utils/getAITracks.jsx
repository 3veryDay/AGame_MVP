
export const getAITracks = async ({ seedGenres, token, limit = 10 }) => {
    const query = new URLSearchParams({
      seed_genres: seedGenres.join(","),
      target_energy: 0.7,
      target_valence: 0.6,
      limit,
    });
  
    const res = await fetch(`https://api.spotify.com/v1/recommendations?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    return data.tracks.map(track => ({
      uri: track.uri,
      name: track.name,
      artist: track.artists?.[0]?.name || "",
      image: track.album?.images?.[0]?.url || "",
    }));
  };
  