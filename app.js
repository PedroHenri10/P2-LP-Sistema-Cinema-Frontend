const API_URL = 'http://localhost:3000';

const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => document.querySelectorAll(selector);

let currentSelectedSeats = [];

getElements('.nav-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        getElements('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        getElements('.view-section').forEach(section => section.classList.add('hidden'));
        
        const viewName = e.target.dataset.view;
        const viewElement = document.getElementById(`view-${viewName}`);
        if(viewElement) {
            viewElement.classList.remove('hidden');
            loadViewData(viewName); 
        }
    });
});

function loadViewData(view) {
    if (view === 'movies') fetchMovies();
    if (view === 'rooms') fetchRooms();
    if (view === 'sessions') {
        fetchSessions();
        populateSessionFilters(); 
    }
    if (view === 'sales') fetchSales();
}

async function fetchMovies() {
    const list = getElement('#moviesList');
    list.innerHTML = '<p>Carregando filmes...</p>';

    const busca = getElement('#searchMovieInput').value;
    const categoria = getElement('#filterCategory').value;
    const classificacao = getElement('#filterRating').value;

    const query = new URLSearchParams();
    if (busca) query.append('busca', busca);
    if (categoria) query.append('categoria', categoria);
    if (classificacao) query.append('classificacao', classificacao);

    try {
        const res = await fetch(`${API_URL}/filmes?${query.toString()}`);
        const data = await res.json();

        if (!categoria) {
            updateCategoryFilter(data);
        }

        if (data.length === 0) {
            list.innerHTML = '<p>Nenhum filme encontrado.</p>';
            return;
        }

        list.innerHTML = data.map(m => `
            <div class="card">
                <div>
                    <h3>${m.titulo}</h3>
                    <p>${m.genero} • ${m.duracao} min</p>
                    <p>Classificação: ${m.classificacao}</p>
                </div>
                <div class="card-actions">
                    <button onclick="openMovieDetails('${m._id}')">Detalhes</button>
                    <button onclick="editMovie('${m._id}')">Editar</button>
                    <button onclick="deleteMovie('${m._id}')" style="color:#ff6b6b">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
        console.error(error);
    }
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/filmes/generos`);
        const generos = await res.json();
        
        const select = document.getElementById('filterCategory');
        
        select.innerHTML = '<option value="">Todas as categorias</option>';
        
        generos.forEach(genero => {
            select.innerHTML += `<option value="${genero}">${genero}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function updateCategoryFilter(movies) {
    const select = getElement('#filterCategory');
    const currentVal = select.value;
    
    const categorias = [...new Set(movies.map(m => m.genero))];
    
    let html = '<option value="">Todas as categorias</option>';
    categorias.forEach(cat => {
        html += `<option value="${cat}">${cat}</option>`;
    });
    
    select.innerHTML = html;
    select.value = currentVal;
}

getElement('#movieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = getElement('#movieId').value;
    const movieData = {
        titulo: getElement('#movieTitle').value,
        duracao: getElement('#movieDuration').value,
        classificacao: getElement('#movieRating').value,
        genero: getElement('#movieGenre').value,
        sinopse: getElement('#movieSynopsis').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/filmes/${id}` : `${API_URL}/filmes`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });

        if (res.ok) {
            alert('Filme salvo com sucesso!');
            getElement('#movieModal').classList.add('hidden');
            fetchMovies();
        } else {
            alert('Erro ao salvar filme');
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão');
    }
});

window.editMovie = async function(id) {
    try {
        const res = await fetch(`${API_URL}/filmes/${id}`);
        const m = await res.json();

        getElement('#movieId').value = m._id;
        getElement('#movieTitle').value = m.titulo;
        getElement('#movieDuration').value = m.duracao;
        getElement('#movieRating').value = m.classificacao;
        getElement('#movieGenre').value = m.genero;
        getElement('#movieSynopsis').value = m.sinopse || '';

        getElement('#movieModal').classList.remove('hidden');
    } catch (err) {
        alert('Erro ao carregar dados do filme');
    }
};

window.openMovieDetails = async function(id) {
    const res = await fetch(`${API_URL}/filmes/${id}`);
    const m = await res.json();
    
    getElement('#detailsTitle').innerText = m.titulo;
    getElement('#detailsInfo').innerText = 
        `${m.genero} • ${m.duracao} min • Classificação ${m.classificacao}`;
    getElement('#detailsSynopsis').innerText = m.sinopse || 'Sem sinopse';
    
    getElement('#movieDetailsModal').classList.remove('hidden');
};

window.closeMovieDetails = () => getElement('#movieDetailsModal').classList.add('hidden');

getElement('#btnOpenMovieForm').onclick = () => {
    getElement('#movieForm').reset();
    getElement('#movieId').value = ''; 
    getElement('#movieModal').classList.remove('hidden');
};

getElement('#btnCancelMovie').onclick = () => getElement('#movieModal').classList.add('hidden');

window.deleteMovie = async function(id) {
    if(!confirm('Tem certeza?')) return;
    await fetch(`${API_URL}/filmes/${id}`, { method: 'DELETE' });
    fetchMovies();
};

getElement('#searchMovieInput').addEventListener('input', fetchMovies);
getElement('#filterCategory').addEventListener('change', fetchMovies);
getElement('#filterRating').addEventListener('change', fetchMovies);

async function fetchRooms() {
    const container = getElement('#roomsContainer');
    container.innerHTML = '<p>Carregando salas...</p>';

    try {
        const res = await fetch(`${API_URL}/salas`);
        const rooms = await res.json();

        container.innerHTML = rooms.map(room => {
            let seatsHtml = '';
            for(let i=0; i<room.capacidade; i++) {
                seatsHtml += `<div class="seat free"></div>`;
            }

            return `
                <div class="room-card">
                    <div class="room-header">
                        <h3>${room.nome} <small>(${room.capacidade} lugares)</small></h3>
                        <span class="status-badge ${room.ativa ? 'status-active' : 'status-inactive'}">
                            ${room.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                    <div class="seat-map">
                        ${seatsHtml}
                    </div>
                    <div style="margin-top: 15px;">
                        <button onclick="toggleRoomStatus('${room._id}', ${!room.ativa})">
                            ${room.ativa ? 'Desativar Sala' : 'Ativar Sala'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar salas.</p>';
    }
}

window.toggleRoomStatus = async function(id, newStatus) {
    try {
        await fetch(`${API_URL}/salas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativa: newStatus })
        });
        fetchRooms();
    } catch (error) {
        alert('Erro ao alterar status da sala');
    }
};

async function populateSessionFilters() {
    try {
        const [filmes, salas] = await Promise.all([
            fetch(`${API_URL}/filmes`).then(r => r.json()),
            fetch(`${API_URL}/salas`).then(r => r.json())
        ]);

        const filterMovie = getElement('#sessionFilterMovie');
        const filterRoom = getElement('#sessionFilterRoom');

        const currentMovie = filterMovie.value;
        const currentRoom = filterRoom.value;

        filterMovie.innerHTML = '<option value="">Filtrar Filme</option>' + 
            filmes.map(f => `<option value="${f._id}">${f.titulo}</option>`).join('');
        
        filterRoom.innerHTML = '<option value="">Filtrar Sala</option>' + 
            salas.map(s => `<option value="${s._id}">${s.nome}</option>`).join('');

        filterMovie.value = currentMovie;
        filterRoom.value = currentRoom;
        
    } catch (e) {
        console.error("Erro ao popular filtros de sessão", e);
    }
}

async function fetchSessions() {
    const list = getElement('#sessionsList');
    list.innerHTML = '<p>Carregando...</p>';
    
    const filmeId = getElement('#sessionFilterMovie').value;
    const salaId  = getElement('#sessionFilterRoom').value;
    const data    = getElement('#sessionFilterDate').value;

    const query = new URLSearchParams();
    if (filmeId) query.append('filmeId', filmeId);
    if (salaId)  query.append('salaId', salaId);
    if (data)    query.append('data', data); 

    try {
        const res = await fetch(`${API_URL}/sessoes/search?${query.toString()}`);
        const sessions = await res.json();

        if (!sessions.length) {
            list.innerHTML = '<p>Nenhuma sessão encontrada</p>';
            return;
        }

        list.innerHTML = sessions.map(s => `
            <div class="session-item">
                <div>
                    <strong>${s.filme ? s.filme.titulo : 'Filme Removido'}</strong>
                    <div>
                        ${s.sala ? s.sala.nome : 'Sala Removida'} 
                        - ${s.data.split('-').reverse().join('/')} às ${s.horario}
                    </div>
                </div>
                <div>
                    <button onclick="editSession('${s._id}')">Editar</button>
                    <button onclick="deleteSession('${s._id}')" style="color:#ff6b6b">
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p>Erro ao carregar sessões</p>';
    }
}

getElement('#sessionFilterMovie').addEventListener('change', fetchSessions);
getElement('#sessionFilterRoom').addEventListener('change', fetchSessions);
getElement('#sessionFilterDate').addEventListener('change', fetchSessions);

window.editSession = async function(id) {
    try {
        const res = await fetch(`${API_URL}/sessoes/search`); 
        const sessoes = await res.json();
        const s = sessoes.find(x => x._id === id);

        if(!s) return alert('Sessão não encontrada');

        await loadSessionFormOptions();

        getElement('#sessionId').value = s._id;
        getElement('#sessionMovieSelect').value = s.filme._id;
        getElement('#sessionRoomSelect').value = s.sala._id;
        getElement('#sessionDate').value = s.data;
        getElement('#sessionTime').value = s.horario;
        getElement('#sessionPrice').value = s.preco;

        getElement('#sessionsListContainer').classList.add('hidden');
        getElement('#sessionFormContainer').classList.remove('hidden');
    } catch(e) {
        console.error(e);
        alert('Erro ao editar sessão');
    }
};

window.deleteSession = async function(id) {
    if(!confirm('Excluir sessão?')) return;
    await fetch(`${API_URL}/sessoes/${id}`, { method: 'DELETE' });
    fetchSessions();
};

async function loadSessionFormOptions() {
    const filmesRes = await fetch(`${API_URL}/filmes`);
    const salasRes = await fetch(`${API_URL}/salas`);
    const filmes = await filmesRes.json();
    const salas = await salasRes.json();

    const movieSelect = getElement('#sessionMovieSelect');
    const roomSelect = getElement('#sessionRoomSelect');

    movieSelect.innerHTML = filmes.map(f => `<option value="${f._id}">${f.titulo}</option>`).join('');
    roomSelect.innerHTML = salas.map(s => `<option value="${s._id}">${s.nome}</option>`).join('');
}

getElement('#btnShowSessionForm').onclick = async () => {
    getElement('#sessionsListContainer').classList.add('hidden');
    getElement('#sessionFormContainer').classList.remove('hidden');
    getElement('#sessionForm').reset();
    getElement('#sessionId').value = ''; 
    await loadSessionFormOptions();
};

getElement('#btnCancelSession').onclick = () => {
    getElement('#sessionFormContainer').classList.add('hidden');
    getElement('#sessionsListContainer').classList.remove('hidden');
};

getElement('#sessionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = getElement('#sessionId').value;

    const sessao = {
        filme: getElement('#sessionMovieSelect').value,
        sala: getElement('#sessionRoomSelect').value,
        data: getElement('#sessionDate').value,
        horario: getElement('#sessionTime').value,
        preco: Number(getElement('#sessionPrice').value)
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/sessoes/${id}` : `${API_URL}/sessoes`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessao)
        });

        if (!res.ok) throw new Error('Erro ao salvar');

        alert(id ? 'Sessão atualizada!' : 'Sessão criada!');
        
        getElement('#sessionFormContainer').classList.add('hidden');
        getElement('#sessionsListContainer').classList.remove('hidden');
        fetchSessions();
    } catch (err) {
        alert('Erro: ' + err.message);
    }
});

async function fetchSales() {
    const list = getElement('#salesList');
    list.innerHTML = '<p>Carregando...</p>';

    try {
        const res = await fetch(`${API_URL}/vendas`);
        const vendas = await res.json();

        list.innerHTML = vendas.map(v => `
            <div class="card">
                <div>
                    <h3>Venda #${v._id.substr(-6)}</h3>
                    <p>Cliente: ${v.comprador}</p>
                    <p>Filme: ${v.sessao && v.sessao.filme ? v.sessao.filme.titulo : 'Filme indisponível'}</p>
                    <p>Sala: ${v.sessao && v.sessao.sala ? v.sessao.sala.nome : '?'}</p>
                    <p>Assentos: ${v.assentos.join(', ')}</p>
                </div>
                <div class="total-display" style="margin-top:10px; font-size: 0.9em">
                    R$ ${v.valorTotal ? v.valorTotal.toFixed(2) : '-'}
                </div>
            </div>
        `).join('');
    } catch(e) { console.error(e); }
}

getElement('#btnShowSaleForm').onclick = async () => {
    getElement('#salesListContainer').classList.add('hidden');
    getElement('#saleFormContainer').classList.remove('hidden');
    getElement('#saleForm').reset();
    getElement('#availableSeatsDisplay').innerText = '-';
    getElement('#saleTotalValue').innerText = '0,00';
    getElement('#saleSeatsInput').value = '';
    
    const res = await fetch(`${API_URL}/sessoes/search`); 
    const sessions = await res.json();
    
    const select = getElement('#saleSessionSelect');
    select.innerHTML = '<option value="">Selecione a Sessão</option>';
    select.innerHTML += sessions.map(s => `
        <option value="${s._id}" data-price="${s.preco}">
            ${s.filme ? s.filme.titulo : 'S/ Filme'} | ${s.data} - ${s.horario} | ${s.sala ? s.sala.nome : 'S/ Sala'}
        </option>
    `).join('');
};

getElement('#btnCancelSale').onclick = () => {
    getElement('#saleFormContainer').classList.add('hidden');
    getElement('#salesListContainer').classList.remove('hidden');
};

getElement('#saleSeatsInput').addEventListener('click', () => {
    const sessaoId = getElement('#saleSessionSelect').value;
    if(!sessaoId) return alert('Selecione uma sessão primeiro');
    openSeatMap(sessaoId);
});

function updateSaleTotal() {
    const select = getElement('#saleSessionSelect');
    const price = parseFloat(select.options[select.selectedIndex].dataset.price || 0);
    const seats = getElement('#saleSeatsInput').value.split(',').filter(x => x).length;
    getElement('#saleTotalValue').innerText = (price * seats).toFixed(2);
    getElement('#availableSeatsDisplay').innerText = seats > 0 ? `${seats} assento(s)` : '-';
}

async function openSeatMap(sessaoId) {
    const resSessao = await fetch(`${API_URL}/sessoes/search`);
    const sessoes = await resSessao.json();
    const sessao = sessoes.find(s => s._id === sessaoId);

    if(!sessao || !sessao.sala) return alert('Erro ao carregar sala desta sessão');

    const resOcupados = await fetch(`${API_URL}/vendas/assentos/${sessaoId}`);
    const ocupados = await resOcupados.json();

    const seatMap = getElement('#seatMap');
    seatMap.innerHTML = '';
    
    currentSelectedSeats = []; 

    for (let i = 1; i <= sessao.sala.capacidade; i++) {
        const seat = document.createElement('div');
        const isOccupied = ocupados.includes(i);
        
        seat.className = `seat ${isOccupied ? 'occupied' : 'free'}`;
        seat.innerText = i;
        
        if(isOccupied) {
            seat.style.backgroundColor = '#e74c3c';
            seat.style.cursor = 'not-allowed';
        } else {
            seat.onclick = () => toggleSeatSelection(i, seat);
        }
        
        seatMap.appendChild(seat);
    }
    
    getElement('#seatModal').classList.remove('hidden');
}

function toggleSeatSelection(num, seatElem) {
    const index = currentSelectedSeats.indexOf(num);
    if(index === -1) {
        currentSelectedSeats.push(num);
        seatElem.style.backgroundColor = '#27ae60'; 
    } else {
        currentSelectedSeats.splice(index, 1);
        seatElem.style.backgroundColor = '#34495e'; 
    }
}

window.closeSeatModal = function() {
    currentSelectedSeats.sort((a,b) => a - b);
    getElement('#saleSeatsInput').value = currentSelectedSeats.join(',');
    updateSaleTotal();
    getElement('#seatModal').classList.add('hidden');
};


getElement('#saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const select = getElement('#saleSessionSelect');
    const price = parseFloat(select.options[select.selectedIndex].dataset.price || 0);
    const assentosStr = getElement('#saleSeatsInput').value; 
    
    if(!assentosStr) return alert('Selecione ao menos um assento.');

    const assentosArray = assentosStr.split(',').map(num => parseInt(num.trim()));

    const novaVenda = {
        sessao: select.value, 
        assentos: assentosArray,
        comprador: getElement('#saleCustomerName').value,
        valorTotal: price * assentosArray.length
    };

    try {
        const res = await fetch(`${API_URL}/vendas`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(novaVenda)
        });

        if(res.ok) {
            alert('Venda realizada!');
            getElement('#saleFormContainer').classList.add('hidden');
            getElement('#salesListContainer').classList.remove('hidden');
            fetchSales();
        } else {
            const err = await res.json();
            alert('Erro: ' + (err.error || 'Falha na venda'));
        }
    } catch(e) {
        alert('Erro de conexão');
    }
});

loadViewData('movies');
loadCategories();