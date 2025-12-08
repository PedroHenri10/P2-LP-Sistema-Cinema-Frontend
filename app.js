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

async function fetchMovies() {
    const list = getElement('#moviesList');
    list.innerHTML = '<p>Carregando filmes...</p>';
    
    try {
        const res = await fetch(`${API_URL}/filmes`);
        const data = await res.json();
        
        if(data.length === 0) {
            list.innerHTML = '<p>Nenhum filme cadastrado.</p>';
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
                    <button onclick="alert('Sinopse: ${m.sinopse || 'Sem sinopse'}')">Detalhes</button>
                    <button onclick="deleteMovie('${m._id}')" style="color: #ff6b6b">Excluir</button>
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


async function fetchSessions() {
    const list = getElement('#sessionsList');
    list.innerHTML = '<p>Carregando...</p>';
    
    try {
        const res = await fetch(`${API_URL}/sessoes`);
        const sessions = await res.json();

        list.innerHTML = sessions.map(s => `
            <div class="session-item">
                <div>
                    <strong>${s.filme ? s.filme.titulo : 'Filme Removido'}</strong>
                    <div>${s.sala ? s.sala.nome : 'Sala Removida'} - ${s.data} às ${s.horario}</div>
                </div>
                <div>
                    <button onclick="deleteSession('${s._id}')" style="color: #ff6b6b">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch(e) {
        console.error(e);
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

loadViewData('movies');