const { insertProcess, getAllProcess, updateProcess, deleteProcess } = require('./database');
const { execFile } = require('child_process');
const { shell } = require('electron');
// Função para iniciar o processo
let itens = getAllProcess();
// let selProcessIndex = null

let dadosProcesso = {};
function startProcess(command, parameters) {
    if (command.includes('http')) {
        shell.openExternal(command);
        return;
    }

    execFile(command, parameters, (error, stdout, stderr) => {
        if (error) {
            console.error('Erro ao executar o processo:', error.message);
            return;
        }

        if (stderr) {
            console.error('Erro no processo:', stderr);
            return;
        }

        console.log('Saída do processo:', stdout);
    });
}

function tratarProcess(process) {
    if (process.execValue) {
        // console.log('Executando comando:', process.value);
        startProcess(process.value, process.parameters.split(";") || []);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const txtPesquisa = document.getElementById('txtPesquisa');
    const lstItens = document.getElementById('lstItens');
    // const btnSelect = document.getElementById('btnSelect');

    // let itens = getAllProcess(); // Simulação de dados

    const campos = [
        { name: 'name', required: true, textCompl: '' },
        { name: 'value', required: true, textCompl: '' },
        { name: 'parameters', required: false, default: '', textCompl: ' separando por ";"' },
        { name: 'showInSearchField', required: false, default: 0, textCompl: '' },
        { name: 'sendToTransferArea', required: false, default: 0, textCompl: '' },
        { name: 'searchInValue', required: false, default: 0, textCompl: '' },
        { name: 'showValue', required: false, default: 0, textCompl: '' },
        { name: 'execValue', required: false, default: 1, textCompl: '' },
        { name: 'inative', required: false, default: 0, textCompl: '' },
        { name: 'processParent', required: false, default: null, textCompl: '' }
    ];

    let campoAtual = 0;
    let action = "search" // insert / delete / update / delConfirm / updSelItem
    // console.log('declarada action', action)
    // let campo = '';
    // Função para renderizar a lista de itens preenchidos
    const renderizarLista = () => {
        lstItens.innerHTML = ''; // Limpa a lista
        for (const campo in dadosProcesso) {
            const div = document.createElement('div');
            div.textContent = `${campo}: ${dadosProcesso[campo]}`;
            div.style.padding = '5px';
            lstItens.appendChild(div);
        }
        if (action === "update") {
            let div = document.createElement('div');
            div.innerHTML = `<hr>digite espaço para definir o valor default (quando houver)`;
            div.style.padding = '5px';
            lstItens.appendChild(div);
        }
    };

    // Função para pedir o valor de cada campo
    const pedirCampo = (campo) => {

        txtPesquisa.value = '';
        let compl = ''
        if (action == "insert") {
            compl = (
                campo.required || campo.default !== undefined
                    ? `(${(campo.required ? 'Required' : (campo.default !== undefined ? 'Default: ' + campo.default : ''))})`
                    : ''
            ) + (campo.textCompl);
        } else if (action == "update") {
            // const texto = (
            //     campo.default !== undefined
            //         ? ` ou espaço para valor default -> ${campo.default}`
            //         : ''
            // ) + (campo.textCompl);
            compl = `(atual: ${dadosProcesso[campo.name]})`

        }

        txtPesquisa.placeholder = `Digite o valor para o campo '${campo.name}' ${compl}`;

    };


    const renderList = async (filter = '') => {
        lstItens.innerHTML = '';

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            if (action != 'update'
                && (filter === '' || item.name.toLowerCase().includes(filter.toLowerCase()))) {
                const div = await document.createElement('div');
                div.textContent = item.name;
                div.style.padding = '5px';
                div.style.cursor = 'pointer';
                div.className = 'item-list';
                // div.addEventListener('click', () => alert(`Selecionado: ${item.name}`));
                console.log('action:', action);
                if (action === 'delete') {
                    div.addEventListener('click', async () => {
                        await deleteProcess(item.id);
                        action = 'search';
                        txtPesquisa.value = '';
                        txtPesquisa.placeholder = ''
                        itens = await getAllProcess()
                        await renderList('')
                    });
                } else if (action === 'updSelItem') {

                    div.addEventListener('click', async () => {
                        dadosProcesso = item;
                        action = 'update';
                        await renderizarLista()
                        // await pedirCampo(campos[campoAtual]);
                    });
                } else {
                    div.addEventListener('click', () => tratarProcess(item));
                }
                lstItens.appendChild(div);
            }
        }
    };

    const checkIfDirectory = (text) => {
        // console.log('Verificando se é diretório:', text);
        // Verifica se o texto corresponde a um diretório (simulação do comportamento do C#)
        const fs = require('fs');
        const path = require('path');

        if (!text.trim()) return;

        const invalidChars = /[<>:"/\\|?*]/;
        if (!invalidChars.test(text) && path.isAbsolute(text)) {
            try {
                const dirInfo = fs.statSync(text);
                if (dirInfo.isDirectory()) {
                    // Simula a função BuscaCaminhos
                    alert(`Diretório encontrado: ${text}`);
                    // Aqui você pode adicionar a lógica para buscar arquivos dentro do diretório
                } else {
                    alert('Caminho não é um diretório válido');
                }
            } catch (err) {
                // Se falhar em encontrar o diretório, podemos tentar fazer um ajuste similar ao do C#
                const lastSlashIndex = text.lastIndexOf('\\');
                if (lastSlashIndex > 1) {
                    const dirPath = text.substring(0, lastSlashIndex + 1);
                    const fileName = text.substring(lastSlashIndex + 1);
                    alert(`Tentando buscar caminho: ${dirPath}, nome: ${fileName}`);
                }
            }
        }
    };

    // O comportamento que deve ser executado quando o texto mudar
    txtPesquisa.addEventListener('input', () => {
        // console.log('Texto mudou:', txtPesquisa.value);
        try {
            const searchText = txtPesquisa.value;
            // renderList(searchText); // Renderiza a lista com filtro
            // checkIfDirectory(searchText); // Verifica se é um diretório

            // if (txtPesquisa.value.trim()) {
            renderList(searchText);
            // } else {
            //     lstItens.innerHTML = ''; // Limpar a lista se o campo estiver vazio
            // }
        } catch (err) {
            console.error('Erro na pesquisa:', err);
            alert('Erro na pesquisa: ' + err.message);
        }
    });

    txtPesquisa.addEventListener('keyup', async (event) => {
        switch (event.key) {
            case 'Enter':
                if (action === "update") {
                    if (campoAtual === null) {
                        campoAtual = 0
                    } else {
                        if (campos[campoAtual].default != undefined && txtPesquisa.value == ' ') {
                            dadosProcesso[campos[campoAtual].name] = campos[campoAtual].default;
                        } else if (!txtPesquisa.value.trim()) {
                            dadosProcesso[campos[campoAtual].name] = dadosProcesso[campos[campoAtual].name];
                        } else {
                            dadosProcesso[campos[campoAtual].name] = txtPesquisa.value;
                        }
                        campoAtual++;
                    }
                    if (campoAtual < campos.length) {
                        pedirCampo(campos[campoAtual]);
                        renderizarLista();
                    } else {
                        await updateProcess(dadosProcesso);
                        // alert('Processo atualizado com sucesso!');
                        action = "search";
                        // console.log('redefinida action', action)
                        txtPesquisa.placeholder = ''
                        txtPesquisa.value = dadosProcesso.name;
                        itens = await getAllProcess()
                        renderList(dadosProcesso.name)
                    }
                }
                else if (action === "insert") {
                    // console.log('Pressionou Enter');
                    if (!txtPesquisa.value.trim()) {
                        if (campos[campoAtual].required) {
                            alert('Campo obrigatório não preenchido', campoAtual);
                            pedirCampo(campos[campoAtual])
                            return;
                        }
                        dadosProcesso[campos[campoAtual].name] = campos[campoAtual].default;
                    } else {
                        dadosProcesso[campos[campoAtual].name] = txtPesquisa.value;
                    }
                    campoAtual++;
                    if (campoAtual < campos.length) {
                        pedirCampo(campos[campoAtual]);
                        renderizarLista();
                    } else {
                        await insertProcess(dadosProcesso);
                        action = "search";
                        // console.log('redefinida action', action)
                        txtPesquisa.placeholder = ''
                        txtPesquisa.value = dadosProcesso.name;
                        itens = await getAllProcess()
                        renderList(dadosProcesso.name)
                    }
                } else if (txtPesquisa.value === '/ins') {
                    campoAtual = 0
                    action = "insert";
                    // console.log('Pressionou Enter');
                    pedirCampo(campos[campoAtual]);
                    renderizarLista();
                } else if (txtPesquisa.value === '/del') {
                    campoAtual = 0
                    action = "delete";
                    // console.log('Pressionou Enter para deletar');
                    txtPesquisa.placeholder = `Selecione o processo a ser deletado`;
                    txtPesquisa.value = '';
                    // renderizarLista
                } else if (txtPesquisa.value === '/upd') {
                    campoAtual = null
                    action = "updSelItem";
                    // console.log('Pressionou Enter para deletar');
                    txtPesquisa.placeholder = `Selecione o processo a ser atualizado`;
                    txtPesquisa.value = '';
                    // renderizarLista
                }
                break;
            case 'ArrowDown':
                event.preventDefault(); // Impede o comportamento padrão do navegador
                const items = Array.from(lstItens.getElementsByClassName('item-list'));
                if (items.length > 0) {
                    lstItens.focus();
                    items.forEach(item => item.classList.remove('selected')); // Remove seleção de todos os itens
                    items[0].classList.add('selected'); // Seleciona o primeiro item
                }
            default:
                break;
        }


    });

    // btnSelect.addEventListener('click', () => {
    //     const selected = Array.from(lstItens.children).find(child => child.style.backgroundColor === 'lightblue');
    //     if (selected) {
    //         alert(`Você selecionou: ${selected.textContent}`);
    //     } else {
    //         alert('Nenhum item selecionado!');
    //     }
    // });
    lstItens.addEventListener('keydown', async (event) => {
        const items = Array.from(lstItens.getElementsByClassName('item-list'));
        const selectedIndex = items.findIndex(item => item.classList.contains('selected'));

        if (event.key === 'ArrowDown' && selectedIndex < items.length - 1) {
            event.preventDefault();
            items[selectedIndex].classList.remove('selected');
            items[selectedIndex + 1].classList.add('selected');
        } else if (event.key === 'ArrowUp') {
            if (selectedIndex > 0) {
                event.preventDefault();
                items[selectedIndex].classList.remove('selected');
                items[selectedIndex - 1].classList.add('selected');
            } else {
                items[0].classList.remove('selected');
                txtPesquisa.focus();
            }
        } else if (event.key === 'Enter') {
            if (selectedIndex >= 0) {
                if (action == 'updSelItem') {
                    event.preventDefault();
                }
                txtPesquisa.value = '';
                txtPesquisa.focus();
                await items[selectedIndex].classList.remove('selected');
                await items[selectedIndex].click()
            }
        }
    });

    // lstItens.addEventListener('click', event => {
    //     Array.from(lstItens.children).forEach(child => (child.style.backgroundColor = ''));
    //     event.target.style.backgroundColor = 'lightblue';
    // });


    renderList(); // Renderiza a lista ao carregar
});
