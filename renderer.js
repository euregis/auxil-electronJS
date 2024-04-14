const { ipcRenderer } = require('electron');

console.log("AAA")
document.addEventListener('DOMContentLoaded', () => {
    const txtPesquisa = document.getElementById('txtPesquisa');
    const lstItens = document.getElementById('lstItens');
    console.log("AAA2")

    txtPesquisa.addEventListener('input', (event) => {
        // Lógica para atualizar a lista de itens com base na entrada do usuário
        // Você precisará implementar isso usando IPC para comunicação entre processos no Electron

    });

    lstItens.addEventListener('click', (event) => {
        // Lógica para lidar com o clique do usuário em um item da lista
        // Você precisará implementar isso usando IPC para comunicação entre processos no Electron
    });
});
