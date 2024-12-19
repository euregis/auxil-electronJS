const { app, BrowserWindow, globalShortcut, Tray, Menu, screen, dialog } = require('electron');
const path = require('path');
const { db, createTable, insertProcess, getAllProcess, updateProcess, deleteProcess } = require('./database');

let mainWindow;
let tray;

let alturaTela = 200;
let larguraTela = 320;

// Função para exibir ou ocultar a janela
function ExibeOculta(exibeTela) {
    try {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const x = width - mainWindow.getBounds().width;
        const y = height - mainWindow.getBounds().height - 25;

        mainWindow.setBounds({ x, y });

        if (exibeTela) {
            mainWindow.show(); // Exibe a janela
        } else {
            mainWindow.hide(); // Oculta a janela
        }

        if (exibeTela) {
            mainWindow.setFullScreen(false); // Caso esteja em tela cheia, retorna ao tamanho normal
        }
    } catch (error) {
        console.error(error); // Trata exceções, se necessário
    }
}

// Função para alternar a janela
function toggleWindow() {
    ExibeOculta(false);
}

function closeApp() {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        } else {
            console.log('Banco de dados fechado');
        }
    });
    app.quit();
}

// Função para alternar o ícone da bandeja
function toggleTray() {
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Abrir', click: () => mainWindow.show() },
        { label: 'Ocultar', click: () => mainWindow.hide() },
        { label: 'Sair', click: () => closeApp() },
    ]));
}

// Função para criar a janela
function createWindow() {
    mainWindow = new BrowserWindow({
        width: larguraTela,
        height: alturaTela,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    Menu.setApplicationMenu(null); // Remove o menu da aplicação
    mainWindow.loadFile('index.html'); // Carrega a interface HTML

    // Registrar os atalhos globais
    globalShortcut.register('Ctrl+Shift+W', () => mainWindow.show());
    globalShortcut.register('Ctrl+Q', () => closeApp());
    globalShortcut.register('Ctrl+Shift+T', toggleTray);
    globalShortcut.register('Ctrl+Shift+H', toggleWindow);
    globalShortcut.register('Escape', () => ExibeOculta(false)); // Oculta a janela ao pressionar ESC

    mainWindow.on('focus', () => {
        console.log('focus');
        ExibeOculta(true);
        mainWindow.setBounds({
            x: screen.getPrimaryDisplay().workArea.width - mainWindow.getBounds().width,
            y: screen.getPrimaryDisplay().workArea.height - mainWindow.getBounds().height - 25
        });
        mainWindow.setSize(larguraTela, alturaTela);
        mainWindow.focus();
    });

    mainWindow.on('close', (event) => {
        const response = dialog.showMessageBoxSync({
            type: 'question',
            buttons: ['Sim', 'Não'],
            defaultId: 1,
            title: 'Fechar',
            message: 'Deseja realmente fechar a aplicação?'
        });

        if (response === 1) {
            event.preventDefault(); // Impede o fechamento
        } else {
            closeApp();
        }
    });

    mainWindow.on('blur', () => {
        console.log('A janela perdeu o foco!');
        ExibeOculta(false);  // Oculta a janela ao perder o foco
    });

    // Registra hotkey para esconder a janela
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape') {
            ExibeOculta(false);
        }
    });
    // debugger; // A execução será pausada aqui

    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
}

function UpgradeDatabase() {
    createTable();
}

// Inicialização do app
app.on('ready', () => {
    createWindow(); // Cria a janela principal
    UpgradeDatabase();
});

// Fechar quando a janela for fechada
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.whenReady().then(() => {
    tray = new Tray('cmder_red.ico'); // Ícone de bandeja

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir', click: () => mainWindow.show() },
        { label: 'Sair', click: () => closeApp() },
    ]);

    // Exibe ou oculta a janela com duplo clique no ícone da bandeja
    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });

    tray.on('mouse-move', () => {
        tray.setContextMenu(contextMenu); // Adapte conforme necessidade
    });
    tray.setContextMenu(contextMenu); // Configura o menu da bandeja
});
