// const sqlite3 = require('sqlite3').verbose();
const db = require('better-sqlite3')('./database.db', { verbose: console.log });

// Criação do banco de dados (se não existir)
// const db = new sqlite3.Database('./database.db', (err) => {
//     if (err) {
//         console.error('Erro ao conectar ao banco de dados:', err.message);
//     } else {
//         console.log('Conectado ao banco de dados SQLite');
//     }
// });

// Função para criar uma tabela (se não existir)
// const createTable = () => {
//     const query = `
//     CREATE TABLE IF NOT EXISTS Process (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       value TEXT NOT NULL,
//       parameters TEXT,
//       showInSearchField BOOLEAN NOT NULL,
//       sendToTransferArea BOOLEAN NOT NULL,
//       searchInValue BOOLEAN NOT NULL,
//       showValue BOOLEAN NOT NULL,
//       execValue BOOLEAN NOT NULL,
//       inative BOOLEAN NOT NULL,
//       processParent INTEGER,
//       createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;
//     db.run(query, (err) => {
//         if (err) {
//             console.error('Erro ao criar tabela:', err.message);
//         } else {
//             console.log('Tabela "Process" criada ou já existe');
//         }
//     });
// };

// Função para inserir dados na tabela
const insertProcess = ({ name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent }) => {
    const query = `
    INSERT INTO Process (name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const stmt = db.prepare(query)
        console.log(name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent)
        const info = stmt.run(name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent)
        console.log(info.changes);
    } catch (error) {
        console.log(error)
    }
};

// Função para consultar dados da tabela
const getAllProcess = () => {
    const query = `SELECT id, name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent FROM Process`;
    const result = db.prepare(query).all();
    // const result = []
    // await db.each(query, [], async (err, rows) => {
    //     if (err) {
    //         throw err;
    //     }
    //     await result.push(rows)
    // });
    return result;
};

// Função para atualizar dados na tabela
const updateProcess = ({ id, name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent }) => {
    const query = `
    UPDATE Process 
    SET name = ?, 
        value = ?,
        parameters = ?,
        showInSearchField = ?,
        sendToTransferArea = ?,
        searchInValue = ?,
        showValue = ?,
        execValue = ?,
        inative = ?,
        processParent = ?
    WHERE id = ?`;
    const stmt = db.prepare(query)
    console.log(name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent)
    const info = stmt.run(name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent, id)
    console.log(info.changes);
    // db.run(query, [name, value, parameters, showInSearchField, sendToTransferArea, searchInValue, showValue, execValue, inative, processParent, id], (err) => {
    //     if (err) {
    //         console.error('Erro ao atualizar dados:', err.message);
    //     } else {
    //         console.log(`Tray com ID ${id} atualizado`);
    //     }
    // });
};

// Função para deletar dados na tabela
const deleteProcess = (id) => {
    const query = `DELETE FROM Process WHERE id = ?`;
    const stmt = db.prepare(query);
    const info = stmt.run(id);

    console.log(info.changes);
};

// Exportar as funções para usar em outros arquivos
module.exports = {
    db,
    // createTable,
    insertProcess,
    getAllProcess,
    updateProcess,
    deleteProcess,
};
