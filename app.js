const APIController = (function() {

    const clientId ='';
    const clientSecret ='';

    //Metodos privados
    const _getToken = async () => {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
            body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
    }

    const _getGenres = async (token) => {

        const result = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistsByGenre = async (token, genreID) => {

        const limit = 10;

        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreID}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}` , {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }
    return {
        getToken: function() {
            return _getToken();
        },
        getGenres: function(token) {
            return _getGenres(token);
        },
        getPlaylistsByGenre: function(token, genreID) {
            return _getPlaylistsByGenre(token, genreID);
        },
        getTracks: function(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack: function(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }

})();