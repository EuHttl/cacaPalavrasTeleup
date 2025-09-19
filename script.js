class WordSearchGame {
    constructor() {
        this.gridSize = 15;
 
        this.wordPool = [
            'TELEMARKETING', 'VENDAS', 'CLIENTE', 'TELEFONE', 'INTERNET',
            'ATENDIMENTO', 'OPERADOR', 'CENTRAL', 'LIGACAO', 'CONTATO',
            'SERVICO', 'SUPORTE', 'CHAMADA', 'RECEPTOR', 'DISCADOR',
            'CAMPANHA', 'META', 'SCRIPT', 'ABORDAGEM', 'PROPOSTA',
            'OFERTA', 'PRODUTO', 'PLANO', 'PROMOCAO', 'DESCONTO',
            'FIDELIDADE', 'RENOVACAO', 'UPGRADE', 'PACOTE', 'TARIFA',
            'BANDA', 'FIBRA', 'MODEM', 'ROTEADOR', 'SINAL',
            'COBERTURA', 'VELOCIDADE', 'STREAMING', 'DOWNLOAD', 'WIFI', "TELEUP", "TELECOM", "NUVEM", "CLOUD", "SAAS", "I.A"
        ];
        this.currentWords = []; // Palavras da rodada atual
        this.grid = [];
        this.wordPositions = {};
        this.foundWords = new Set();
        this.gameStarted = false;
        this.timeLeft = 300; // 5 minutos em segundos
        this.timer = null;
        this.selectedCells = [];
        this.isSelecting = false;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameGrid = document.getElementById('gameGrid');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.wordsList = document.getElementById('wordsList');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.finalScore = document.getElementById('finalScore');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Eventos para seleção de palavras
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('grid-cell') && this.gameStarted) {
                this.startSelection(e.target);
            }
        });
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('grid-cell') && this.isSelecting) {
                this.updateSelection(e.target);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
    
    selectRandomWords() {
        // Embaralhar as palavras e selecionar 5 aleatórias
        const shuffled = [...this.wordPool].sort(() => Math.random() - 0.5);
        this.currentWords = shuffled.slice(0, 5);
        console.log('Palavras da rodada:', this.currentWords);
    }
    
    startGame() {
        this.gameStarted = true;
        this.foundWords.clear();
        this.timeLeft = 300;
        
        // Selecionar palavras aleatórias para esta rodada
        this.selectRandomWords();
        
        // Mostrar tela do jogo e esconder tela de início
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';
        
        this.generateGrid();
        this.placeWords();
        this.fillEmptyCells();
        this.renderGrid();
        this.startTimer();
        this.updateScore();
        this.updateWordsList();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.foundWords.clear();
        this.timeLeft = 300;
        this.selectedCells = [];
        this.isSelecting = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Voltar para tela de início
        this.startScreen.style.display = 'flex';
        this.gameScreen.style.display = 'none';
        this.gameOverModal.style.display = 'none';
        
        this.gameGrid.innerHTML = '';
        this.wordsList.innerHTML = '';
        this.updateTimer();
        this.updateScore();
    }
    
    generateGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = new Array(this.gridSize).fill('');
        }
    }
    
    placeWords() {
        this.wordPositions = {};
        const directions = [
            [0, 1],   // horizontal direita
            [1, 0],   // vertical baixo
            [0, -1],  // horizontal esquerda
            [-1, 0]   // vertical cima
        ];
        
        // Embaralhar as palavras para posicionamento aleatório
        const shuffledWords = [...this.currentWords].sort(() => Math.random() - 0.5);
        
        for (const word of shuffledWords) {
            let placed = false;
            let attempts = 0;
            
            // Embaralhar direções para cada palavra
            const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
            
            while (!placed && attempts < 200) {
                const direction = shuffledDirections[attempts % shuffledDirections.length];
                const startRow = Math.floor(Math.random() * this.gridSize);
                const startCol = Math.floor(Math.random() * this.gridSize);
                
                if (this.canPlaceWord(word, startRow, startCol, direction)) {
                    this.placeWord(word, startRow, startCol, direction);
                    placed = true;
                }
                attempts++;
            }
            
            if (!placed) {
                console.warn(`Não foi possível posicionar a palavra: ${word}`);
            }
        }
    }
    
    canPlaceWord(word, row, col, direction) {
        const [dRow, dCol] = direction;
        
        for (let i = 0; i < word.length; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            
            if (newRow < 0 || newRow >= this.gridSize || 
                newCol < 0 || newCol >= this.gridSize) {
                return false;
            }
            
            if (this.grid[newRow][newCol] !== '' && 
                this.grid[newRow][newCol] !== word[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    placeWord(word, row, col, direction) {
        const [dRow, dCol] = direction;
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            this.grid[newRow][newCol] = word[i];
            positions.push([newRow, newCol]);
        }
        
        this.wordPositions[word] = positions;
    }
    
    fillEmptyCells() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === '') {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    renderGrid() {
        this.gameGrid.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.grid[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameGrid.appendChild(cell);
            }
        }
    }
    
    startSelection(cell) {
        if (!this.gameStarted) return;
        
        this.isSelecting = true;
        this.selectedCells = [cell];
        cell.classList.add('selected');
    }
    
    updateSelection(cell) {
        if (!this.isSelecting || this.selectedCells.length === 0) return;
        
        const firstCell = this.selectedCells[0];
        const firstRow = parseInt(firstCell.dataset.row);
        const firstCol = parseInt(firstCell.dataset.col);
        const currentRow = parseInt(cell.dataset.row);
        const currentCol = parseInt(cell.dataset.col);
        
        // Limpar seleção anterior
        this.clearSelection();
        
        // Calcular direção
        const rowDiff = currentRow - firstRow;
        const colDiff = currentCol - firstCol;
        
        let direction = [0, 0];
        if (rowDiff !== 0) direction[0] = rowDiff / Math.abs(rowDiff);
        if (colDiff !== 0) direction[1] = colDiff / Math.abs(colDiff);
        
        // Selecionar células na linha reta
        this.selectedCells = [firstCell];
        firstCell.classList.add('selected');
        
        let currentCellRow = firstRow;
        let currentCellCol = firstCol;
        
        while (currentCellRow !== currentRow || currentCellCol !== currentCol) {
            currentCellRow += direction[0];
            currentCellCol += direction[1];
            
            if (currentCellRow < 0 || currentCellRow >= this.gridSize ||
                currentCellCol < 0 || currentCellCol >= this.gridSize) {
                break;
            }
            
            const cellElement = document.querySelector(
                `[data-row="${currentCellRow}"][data-col="${currentCellCol}"]`
            );
            
            if (cellElement) {
                cellElement.classList.add('selected');
                this.selectedCells.push(cellElement);
            }
        }
    }
    
    endSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        
        const selectedWord = this.selectedCells
            .map(cell => cell.textContent)
            .join('');
        
        const reversedWord = selectedWord.split('').reverse().join('');
        
        // Verificar se a palavra selecionada existe
        if (this.currentWords.includes(selectedWord) || this.currentWords.includes(reversedWord)) {
            const foundWord = this.currentWords.includes(selectedWord) ? selectedWord : reversedWord;
            
            if (!this.foundWords.has(foundWord)) {
                this.foundWords.add(foundWord);
                this.markWordAsFound(foundWord);
                this.updateScore();
                
                if (this.foundWords.size === this.currentWords.length) {
                    this.endGame(true);
                }
            }
        }
        
        this.clearSelection();
    }
    
    clearSelection() {
        this.selectedCells.forEach(cell => {
            if (!cell.classList.contains('found')) {
                cell.classList.remove('selected');
            }
        });
    }
    
    markWordAsFound(word) {
        const positions = this.wordPositions[word];
        if (positions) {
            positions.forEach(([row, col]) => {
                const cell = document.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                );
                if (cell) {
                    cell.classList.add('found');
                    cell.classList.remove('selected');
                }
            });
        }
        
        // Marcar palavra na lista
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerElement.textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Adicionar classe de urgência quando restam menos de 30 segundos
        if (this.timeLeft <= 30) {
            this.timerElement.style.color = '#ff4444';
            this.timerElement.style.animation = 'pulse 1s infinite';
        } else {
            this.timerElement.style.color = '#fff';
            this.timerElement.style.animation = 'none';
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = `${this.foundWords.size}/${this.currentWords.length}`;
    }
    
    updateWordsList() {
        console.log('Atualizando lista de palavras:', this.currentWords);
        // Limpar lista atual
        this.wordsList.innerHTML = '';
        
        // Adicionar palavras da rodada atual
        this.currentWords.forEach(word => {
            const li = document.createElement('li');
            li.setAttribute('data-word', word);
            li.textContent = word;
            this.wordsList.appendChild(li);
        });
        console.log('Lista de palavras atualizada. Total de itens:', this.wordsList.children.length);
    }
    
    resetWordsList() {
        const wordItems = this.wordsList.querySelectorAll('li');
        wordItems.forEach(item => {
            item.classList.remove('found');
        });
    }
    
    endGame(won) {
        this.gameStarted = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.finalScore.textContent = this.foundWords.size;
        
        if (won) {
            this.modalTitle.textContent = 'Parabéns! 🎉';
            this.modalMessage.innerHTML = 
                `Você encontrou todas as <span id="finalScore">${this.foundWords.size}</span> palavras!<br>Tempo restante: ${this.timerElement.textContent}`;
        } else {
            this.modalTitle.textContent = 'Tempo Esgotado! ⏰';
            this.modalMessage.innerHTML = 
                `Você encontrou <span id="finalScore">${this.foundWords.size}</span> de ${this.currentWords.length} palavras!`;
        }
        
        this.gameOverModal.style.display = 'block';
    }
}

// Adicionar animação de pulso para o timer urgente
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new WordSearchGame();
});

// Prevenir seleção de texto durante o jogo
document.addEventListener('selectstart', (e) => {
    if (e.target.classList.contains('grid-cell')) {
        e.preventDefault();
    }
});
