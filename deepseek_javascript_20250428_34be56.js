document.addEventListener('DOMContentLoaded', function() {
    // Preenche a data atual por padrão
    document.getElementById('data').valueAsDate = new Date();
    
    // Preview das fotos selecionadas
    document.getElementById('fotos').addEventListener('change', function(e) {
        const preview = document.getElementById('previewFotos');
        preview.innerHTML = '';
        
        if (this.files) {
            Array.from(this.files).forEach(file => {
                if (!file.type.match('image.*')) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('foto-preview');
                    preview.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        }
    });
    
    // Envio do formulário
    document.getElementById('formFiscalizacao').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os dados do formulário
        const formData = {
            data: document.getElementById('data').value,
            veiculosAbordados: document.getElementById('veiculosAbordados').value,
            veiculosAutuados: document.getElementById('veiculosAutuados').value,
            tipoVeiculo: document.querySelector('input[name="tipoVeiculo"]:checked').value,
            fotos: document.getElementById('fotos').files,
            observacoes: document.getElementById('observacoes').value
        };
        
        // Validação básica
        if (formData.veiculosAutuados > formData.veiculosAbordados) {
            showMessage('O número de veículos autuados não pode ser maior que os abordados!', 'error');
            return;
        }
        
        // Aqui você normalmente enviaria para um backend
        // Por enquanto, vamos armazenar no localStorage
        saveInspection(formData);
        
        // Mostra mensagem de sucesso
        showMessage('Fiscalização registrada com sucesso!', 'success');
        
        // Atualiza a lista de registros
        displayInspections();
        
        // Limpa o formulário (exceto data e fotos)
        this.reset();
        document.getElementById('data').valueAsDate = new Date();
        document.getElementById('previewFotos').innerHTML = '';
    });
    
    // Mostra a lista de fiscalizações
    displayInspections();
});

function saveInspection(data) {
    // Pega os registros existentes ou cria um array vazio
    const inspections = JSON.parse(localStorage.getItem('fiscalizacoes')) || [];
    
    // Cria um novo registro (sem as fotos por enquanto)
    const newInspection = {
        data: data.data,
        veiculosAbordados: data.veiculosAbordados,
        veiculosAutuados: data.veiculosAutuados,
        tipoVeiculo: data.tipoVeiculo,
        observacoes: data.observacoes,
        // Nota: Fotos não são salvas no localStorage por limitações de tamanho
        // Em produção, você enviaria para um servidor
        timestamp: new Date().getTime()
    };
    
    // Adiciona o novo registro
    inspections.push(newInspection);
    
    // Salva no localStorage
    localStorage.setItem('fiscalizacoes', JSON.stringify(inspections));
}

function displayInspections() {
    const inspections = JSON.parse(localStorage.getItem('fiscalizacoes')) || [];
    const registrosDiv = document.getElementById('registros');
    const listaDiv = document.getElementById('listaFiscalizacoes');
    
    if (inspections.length === 0) {
        listaDiv.classList.add('hidden');
        return;
    }
    
    listaDiv.classList.remove('hidden');
    registrosDiv.innerHTML = '';
    
    // Ordena por data (mais recente primeiro)
    inspections.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Mostra os últimos 5 registros
    inspections.slice(0, 5).forEach(insp => {
        const div = document.createElement('div');
        div.classList.add('registro-item');
        div.innerHTML = `
            <strong>${formatDate(insp.data)}</strong><br>
            Veículos: ${insp.veiculosAbordados} abordados, ${insp.veiculosAutuados} autuados<br>
            Tipo predominante: ${insp.tipoVeiculo}<br>
            ${insp.observacoes ? `Obs: ${insp.observacoes}` : ''}
        `;
        registrosDiv.appendChild(div);
    });
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('mensagem');
    msgDiv.textContent = msg;
    msgDiv.className = type;
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        msgDiv.textContent = '';
        msgDiv.className = '';
    }, 5000);
}