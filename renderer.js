const { insertProcess, getAllProcess, updateProcess, deleteProcess } = require('./database');

window.addEventListener('DOMContentLoaded', () => {
    const txtPesquisa = document.getElementById('txtPesquisa');
    const lstItens = document.getElementById('lstItens');
    // const btnSelect = document.getElementById('btnSelect');

    let itens = getAllProcess(); // Simulação de dados

    const campos = [
        { name: 'name', required: true },
        { name: 'value', required: true },
        { name: 'parameters', required: false, default: '' },
        { name: 'showInSearchField', required: false, default: false },
        { name: 'sendToTransferArea', required: false, default: false },
        { name: 'searchInValue', required: false, default: false },
        { name: 'showValue', required: false, default: false },
        { name: 'execValue', required: false, default: true },
        { name: 'inative', required: false, default: false },
        { name: 'processParent', required: false, default: null }
    ];

    let dadosProcesso = {};
    let campoAtual = 0;
    let ins = false
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
    };

    // Função para pedir o valor de cada campo
    const pedirCampo = (campo) => {

        txtPesquisa.value = '';
        const compl =
            campo.required || campo.default !== undefined
                ? `(${(campo.required ? 'Required' : (campo.default !== undefined ? 'Default: ' + campo.default : ''))})`
                : ''

        txtPesquisa.placeholder = `Digite o valor para o campo '${campo.name}' ${compl}`;

    };


    const renderList = async (filter = '') => {
        itens = await getAllProcess()
        console.log('Renderizando lista com filtro:', filter, itens.length);
        lstItens.innerHTML = '';
        // let filteredItens = []
        // if (itens) {
        //     console.log('Itens:', itens);
        //     filteredItens = itens.filter(item => {
        //         console.log('Item:', item, item.name.toLowerCase().includes(filter.toLowerCase()));
        //         return item.name.toLowerCase().includes(filter.toLowerCase());
        //     });
        // }
        console.log('Itens filtrados:', (await itens).length);
        for (let i = 0; i < itens.length; i++) {
            console.log('Item:', itens[i]);
            const item = itens[i];
            if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                const div = await document.createElement('div');
                div.textContent = item.name;
                div.style.padding = '5px';
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => alert(`Selecionado: ${item.name}`));
                lstItens.appendChild(div);
            }
        }
    };

    const checkIfDirectory = (text) => {
        console.log('Verificando se é diretório:', text);
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
        console.log('Texto mudou:', txtPesquisa.value);
        try {
            const searchText = txtPesquisa.value;
            // renderList(searchText); // Renderiza a lista com filtro
            // checkIfDirectory(searchText); // Verifica se é um diretório

            if (txtPesquisa.value.trim()) {
                renderList(searchText);
            } else {
                lstItens.innerHTML = ''; // Limpar a lista se o campo estiver vazio
            }
        } catch (err) {
            console.error('Erro na pesquisa:', err);
            alert('Erro na pesquisa: ' + err.message);
        }
    });

    txtPesquisa.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            if (ins) {
                console.log('Pressionou Enter');
                if (!txtPesquisa.value.trim()) {
                    if (campos[campoAtual].required) {
                        alert('Campo obrigatório não preenchido');
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
                    insertProcess(dadosProcesso);
                    ins = false;
                    txtPesquisa.value = dadosProcesso.name;
                    renderList(dadosProcesso.name)
                }
            } else if (txtPesquisa.value === '/ins') {
                campoAtual = 0
                ins = true;
                console.log('Pressionou Enter');
                pedirCampo(campos[campoAtual]);
                renderizarLista();
            }
        }
        // else if (event.key === 'Escape') {
        //     ins = false;
        //     txtPesquisa.value = '';
        //     renderList('')
        // }
    });

    // btnSelect.addEventListener('click', () => {
    //     const selected = Array.from(lstItens.children).find(child => child.style.backgroundColor === 'lightblue');
    //     if (selected) {
    //         alert(`Você selecionou: ${selected.textContent}`);
    //     } else {
    //         alert('Nenhum item selecionado!');
    //     }
    // });

    lstItens.addEventListener('click', event => {
        Array.from(lstItens.children).forEach(child => (child.style.backgroundColor = ''));
        event.target.style.backgroundColor = 'lightblue';
    });


    renderList(); // Renderiza a lista ao carregar
});
