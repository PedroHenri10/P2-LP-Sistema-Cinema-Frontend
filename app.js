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
        // const res = await fetch(`${API_URL}/movies`); 
        // const data = await res.json();
        
        // MOCK PARA TESTE VISUAL (Remova isso e descomente o fetch acima quando tiver backend)
        const data = [
            { _id: '1', title: 'O Poderoso Chefão', genre: 'Drama', duration: 175, rating: '16' },
            { _id: '2', title: 'Barbie', genre: 'Comédia', duration: 114, rating: '12' }
        ];

        list.innerHTML = data.map(movie => `
            <div class="card">
                <div>
                    <h3>${movie.title}</h3>
                    <p>${movie.genre} • ${movie.duration} min</p>
                    <p>Classificação: ${movie.rating}</p>
                </div>
                <div class="card-actions">
                    <button onclick="alert('Detalhes ID: ${movie._id}')">Detalhes</button>
                    <button onclick="editMovie('${movie._id}')">Editar</button>
                    <button onclick="deleteMovie('${movie._id}')" style="color: #ff6b6b">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p>Erro ao carregar filmes.</p>';
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

    // MOCK
    const rooms = [
        { _id: '101', name: 'Sala 1', capacity: 50, active: true },
        { _id: '102', name: 'Sala 2 VIP', capacity: 30, active: false }
    ];

    container.innerHTML = rooms.map(room => {
        let seatsHtml = '';
        for(let i=0; i<room.capacity; i++) {
            seatsHtml += `<div class="seat free"></div>`;
        }

        return `
            <div class="room-card">
                <div class="room-header">
                    <h3>${room.name} <small>(${room.capacity} lugares)</small></h3>
                    <span class="status-badge ${room.active ? 'status-active' : 'status-inactive'}">
                        ${room.active ? 'Ativa' : 'Inativa'}
                    </span>
                </div>
                <div class="seat-map">
                    ${seatsHtml}
                </div>
                <div style="margin-top: 15px;">
                    <button onclick="toggleRoomStatus('${room._id}', ${!room.active})">
                        ${room.active ? 'Desativar Sala' : 'Ativar Sala'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleRoomStatus(id, newStatus) {
    console.log(`Enviar PUT para /rooms/${id} com active: ${newStatus}`);
    fetchRooms();
}

const sessionListContainer = getElement('#sessionsListContainer');
const sessionFormContainer = getElement('#sessionFormContainer');

getElement('#btnShowSessionForm').onclick = () => {
    sessionListContainer.classList.add('hidden');
    sessionFormContainer.classList.remove('hidden');
    //carregar os selects de filmes e salas via fetch
};

getElement('#btnCancelSession').onclick = () => {
    sessionFormContainer.classList.add('hidden');
    sessionListContainer.classList.remove('hidden');
};

async function fetchSessions() {
    // Buscar sessões do backend e preencher #sessionsList
    const list = getElement('#sessionsList');
    
    // MOCK
    const sessions = [
        { _id: 's1', movie: 'Barbie', room: 'Sala 1', time: '14:00', date: '2023-10-25' },
        { _id: 's2', movie: 'O Poderoso Chefão', room: 'Sala 2 VIP', time: '20:00', date: '2023-10-25' }
    ];

    list.innerHTML = sessions.map(s => `
        <div class="session-item">
            <div>
                <strong>${s.movie}</strong>
                <div>${s.room} - ${s.date} às ${s.time}</div>
            </div>
            <div>
                <button onclick="alert('Editar sessão ${s._id}')">Editar</button>
                <button onclick="alert('Excluir sessão ${s._id}')">Excluir</button>
            </div>
        </div>
    `).join('');
}

const salesListContainer = getElement('#salesListContainer');
const saleFormContainer = getElement('#saleFormContainer');

getElement('#btnShowSaleForm').onclick = () => {
    salesListContainer.classList.add('hidden');
    saleFormContainer.classList.remove('hidden');
};

getElement('#btnCancelSale').onclick = () => {
    saleFormContainer.classList.add('hidden');
    salesListContainer.classList.remove('hidden');
};

async function fetchSales() {
    const list = getElement('#salesList');
    list.innerHTML = '<p>Nenhuma venda encontrada.</p>';
}

getElement('#saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Implementar POST /sales com fetch');
    saleFormContainer.classList.add('hidden');
    salesListContainer.classList.remove('hidden');
    fetchSales();
});

loadViewData('movies');