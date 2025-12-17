const API_URL = 'http://localhost:3000'; 

const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => document.querySelectorAll(selector);

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
    if (view === 'sessions') fetchSessions();
    if (view === 'sales') fetchSales();
}

async function openMovieDetails(id) {
  const res = await fetch(`${API_URL}/filmes/${id}`);
  const m = await res.json();

  getElement('#detailsTitle').innerText = m.titulo;
  getElement('#detailsInfo').innerText =
    `${m.genero} • ${m.duracao} min • Classificação ${m.classificacao}`;
  getElement('#detailsSynopsis').innerText = m.sinopse || 'Sem sinopse';

  getElement('#movieDetailsModal').classList.remove('hidden');
}

function closeMovieDetails() {
  getElement('#movieDetailsModal').classList.add('hidden');
}

async function openEditMovie(id) {
  const res = await fetch(`${API_URL}/filmes/${id}`);
  const m = await res.json();

  getElement('#movieId').value = m._id;
  getElement('#movieTitle').value = m.titulo;
  getElement('#movieDuration').value = m.duracao;
  getElement('#movieRating').value = m.classificacao;
  getElement('#movieGenre').value = m.genero;
  getElement('#movieSynopsis').value = m.sinopse || '';

  getElement('#movieModal').classList.remove('hidden');
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

getElement('#btnOpenMovieForm').onclick = () => {
    getElement('#movieForm').reset();
    getElement('#movieModal').classList.remove('hidden');
};

getElement('#btnCancelMovie').onclick = () => {
    getElement('#movieModal').classList.add('hidden');
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
    const url = id
        ? `${API_URL}/sessoes/${id}`
        : `${API_URL}/sessoes`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessao)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Erro ao salvar sessão');
        }

        alert(id ? 'Sessão atualizada com sucesso!' : 'Sessão criada com sucesso!');

        getElement('#sessionForm').reset();
        getElement('#sessionId').value = '';
        sessionFormContainer.classList.add('hidden');
        sessionListContainer.classList.remove('hidden');

        fetchSessions();

    } catch (err) {
        console.error(err);
        alert('Erro: ' + err.message);
    }
});

async function deleteMovie(id) {
    if(!confirm('Tem certeza?')) return;
    await fetch(`${API_URL}/filmes/${id}`, { method: 'DELETE' });
    fetchMovies();
}

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

async function toggleRoomStatus(id, newStatus) {
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
}

async function editSession(id) {
  const res = await fetch(`${API_URL}/sessoes`);
  const sessoes = await res.json();
  const s = sessoes.find(x => x._id === id);

  getElement('#sessionId').value = s._id;
  getElement('#sessionMovieSelect').value = s.filme._id;
  getElement('#sessionRoomSelect').value = s.sala._id;
  getElement('#sessionDate').value = s.data;
  getElement('#sessionTime').value = s.horario;
  getElement('#sessionPrice').value = s.preco;

  sessionListContainer.classList.add('hidden');
  sessionFormContainer.classList.remove('hidden');
}

const sessionListContainer = getElement('#sessionsListContainer');
const sessionFormContainer = getElement('#sessionFormContainer');

getElement('#btnShowSessionForm').onclick = async () => {
    sessionListContainer.classList.add('hidden');
    sessionFormContainer.classList.remove('hidden');
    
    const filmesRes = await fetch(`${API_URL}/filmes`);
    const salasRes = await fetch(`${API_URL}/salas`);
    const filmes = await filmesRes.json();
    const salas = await salasRes.json();

    const movieSelect = getElement('#sessionMovieSelect');
    const roomSelect = getElement('#sessionRoomSelect');

    movieSelect.innerHTML = filmes.map(f => `<option value="${f._id}">${f.titulo}</option>`).join('');
    roomSelect.innerHTML = salas.map(s => `<option value="${s._id}">${s.nome}</option>`).join('');
};

getElement('#btnCancelSession').onclick = () => {
    sessionFormContainer.classList.add('hidden');
    sessionListContainer.classList.remove('hidden');
};

getElement('#sessionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const novaSessao = {
        filme: getElement('#sessionMovieSelect').value,
        sala: getElement('#sessionRoomSelect').value,
        data: getElement('#sessionDate').value,
        horario: getElement('#sessionTime').value,
        preco: getElement('#sessionPrice').value
    };

    await fetch(`${API_URL}/sessoes`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(novaSessao)
    });
    
    alert('Sessão criada!');
    sessionFormContainer.classList.add('hidden');
    sessionListContainer.classList.remove('hidden');
    fetchSessions();
});

async function fetchSessions() {
    const list = getElement('#sessionsList');
    list.innerHTML = '<p>Carregando...</p>';

    const filmeId = getElement('#sessionFilterMovie')?.value || '';
    const salaId  = getElement('#sessionFilterRoom')?.value || '';
    const data    = getElement('#sessionFilterDate')?.value || '';

    const query = new URLSearchParams();

    if (filmeId) query.append('filmeId', filmeId);
    if (salaId)  query.append('salaId', salaId);
    if (data)    query.append('data', data);

    try {
        const res = await fetch(
            `${API_URL}/sessoes/search?${query.toString()}`
        );
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
                        - ${s.data} às ${s.horario}
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

async function deleteSession(id) {
    if(!confirm('Excluir sessão?')) return;
    await fetch(`${API_URL}/sessoes/${id}`, { method: 'DELETE' });
    fetchSessions();
}

const salesListContainer = getElement('#salesListContainer');
const saleFormContainer = getElement('#saleFormContainer');

getElement('#btnShowSaleForm').onclick = async () => {
    salesListContainer.classList.add('hidden');
    saleFormContainer.classList.remove('hidden');

    const res = await fetch(`${API_URL}/sessoes`);
    const sessions = await res.json();
    const select = getElement('#saleSessionSelect');
    
    select.innerHTML = '<option value="">Selecione a Sessão</option>';
    select.innerHTML += sessions.map(s => `
        <option value="${s._id}">
            ${s.filme?.titulo} (${s.horario}) - ${s.sala?.nome}
        </option>
    `).join('');
};

getElement('#btnCancelSale').onclick = () => {
    saleFormContainer.classList.add('hidden');
    salesListContainer.classList.remove('hidden');
};

getElement('#saleSessionSelect').addEventListener('change', async (e) => {
    const sessaoId = e.target.value;
    if(!sessaoId) return;
    
    getElement('#availableSeatsDisplay').innerText = "Verifique o mapa da sala antes de vender."; 
});

getElement('#saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const assentosStr = getElement('#saleSeatsInput').value; 
    const assentosArray = assentosStr.split(',').map(num => parseInt(num.trim()));

    const novaVenda = {
        sessaoId: getElement('#saleSessionSelect').value, 
        assentos: assentosArray,
        comprador: getElement('#saleCustomerName').value,
        valorTotal: 0 
    };

    const res = await fetch(`${API_URL}/vendas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(novaVenda)
    });

    if(res.ok) {
        alert('Venda realizada!');
        saleFormContainer.classList.add('hidden');
        salesListContainer.classList.remove('hidden');
        fetchSales();
    } else {
        const err = await res.json();
        alert('Erro: ' + err.error);
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
                    <p>Filme: ${v.sessao?.filme?.titulo || '?'}</p>
                    <p>Assentos: ${v.assentos.join(', ')}</p>
                </div>
            </div>
        `).join('');
    } catch(e) { console.error(e); }
}

getElement('#saleSessionSelect').onchange = async (e) => {
  const sessaoId = e.target.value;
  if (!sessaoId) return;

  const resSessao = await fetch(`${API_URL}/sessoes/search`);
  const sessoes = await resSessao.json();
  const sessao = sessoes.find(s => s._id === sessaoId);

  const res = await fetch(`${API_URL}/vendas/ocupados/${sessaoId}`);
  const ocupados = await res.json();

  const seatMap = getElement('#seatMap');
  seatMap.innerHTML = '';

  for (let i = 1; i <= sessao.sala.capacidade; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat ' + (ocupados.includes(i) ? 'occupied' : 'free');
    seat.innerText = i;
    seatMap.appendChild(seat);
  }

  getElement('#seatModal').classList.remove('hidden');
};


loadViewData('movies');
getElement('#searchMovieInput').addEventListener('input', fetchMovies);
getElement('#filterCategory').addEventListener('change', fetchMovies);
getElement('#filterRating').addEventListener('change', fetchMovies);