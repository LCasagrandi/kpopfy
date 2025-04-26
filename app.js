//Modulo API
const APIController = (function() {

    var client_id = '4671c4c3dd7d4cda86acbdae37ccfa00';
    var client_secret = 'a302f5527b644ebbb2cd02a46fbb07d5';

    var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
    };

    request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
        var token = body.access_token;
    }
    });

    //Metodos privados
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


//Modulo UI
const UIController = (function() {

    //referencias para os seletores
    const DOMElements = {
        genreSelect: '#genre',
        playlistSelect: '#playlist',
        buttonSearch: '#search',
        divSongDetail: '#song-detail',
        hfToken: '#hfToken',
        divSongList: '#song-list',
    }

    //metodos publicos
    return{

        //metodo para os input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.genreSelect),
                playlist: document.querySelector(DOMElements.playlistSelect),
                buttonSearch: document.querySelector(DOMElements.buttonSearch),
                divSongDetail: document.querySelector(DOMElements.divSongDetail),
                hfToken: document.querySelector(DOMElements.hfToken),
                divSongList: document.querySelector(DOMElements.divSongList)
            }
        },

        //metodo para criar as opções de generos
        createGenre(text, value) {
            const html = 'caption value="${value}">${text}</option>';
            document.querySelector(DOMElements.genreSelect).insertAdjacentHTML('beforeend', html);
        },

        //metodo para criar as opções de playlists
        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.playlistSelect).insertAdjacentHTML('beforeend', html);
        },

        //metodo para criar as opções de musicas
        createTrack(id, name) {
            const html = `<a href="#" class="song" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSongList).insertAdjacentHTML('beforeend', html);
        },

        //metodo para criar o card de detalhes da musica
        createSongDetail(img, title, artist) {
            const divSongDetail = document.querySelector(DOMElements.divSongDetail);
            divSongDetail.innerHTML = 
            `
            <div class="col-md" id="divSongDetail">
                    <div class="card" style="width: 18rem;">
                        <img src="${img}" class="card-img-top" alt="...">
                        <div class="card-body">
                          <h3 class="card-title">${title}</h3>
                          <h5 class="card-text">${artist}</h5>
                        </div>
                      </div>
                </div>
            `;

            divSongDetail.insertAdjacentElement('beforeend', html);
        },

        resetTrackDetail (){
            this.inputField().divSongDetail.innerHTML = '';
        },

        resetTracks () {
            this.inputField().divSongList.innerHTML = '';
            this.inputField().divSongDetail.value = '';
            this.resetTrackDetail();
        },

        resetPlaylists() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        }
    }
})();

const AppController = (function(APICtrl, UICtrl) {

    const DOMInputs = UICtrl.inputField();

    const loadGenres = async () => {
        const token = await APICtrl.getToken();
        const genres = await APICtrl.getGenres(token);

        genres.forEach(element => {
            UICtrl.createGenre(element.name, element.id);
        });
    }

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylists();
        const token = UICtrl.getStoredToken().token;
        const genreSelect = UICtrl.inputField().genre;
        const genreID = genreSelect.options[genreSelect.selectedIndex].value;
        const playlists = await APICtrl.getPlaylistsByGenre(token, genreID);
        playlists.forEach(p => UICtrl.createPlaylist)
    });

    DOMInputs.buttonSearch.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();
        const token = UICtrl.getStoredToken().token;
        const playlistSelect = UICtrl.inputField().playlist;
        const playlistID = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        tracks.forEach(e => UICtrl.createTrack(e.track.id, t.track.name));
    });

    DOMInputs.divSongList.addEventListener('click', async (e) => {
        e.preventDefault();
        const token = UICtrl.getStoredToken().token;
        const trackEndPoint = e.target.id;
        const track = await APICtrl.getTrack(token, trackEndPoint);
        UICtrl.createSongDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });

    return {
        init() {
            console.log('App is running...');
            loadGenres();
        }
    }
})(UIController, APIController);

AppController.init();