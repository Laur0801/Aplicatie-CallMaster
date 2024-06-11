const { sha256 } = require('../utils/utils');
const { dbPool } = require('../utils/defaults');

// Funcție pentru a conecta și executa interogări pe baza de date MariaDB
async function connectMariaDB(query, params = []) {
    let connection;
    let result;
    try {
        connection = await dbPool.getConnection();
        result = await connection.query(query, params);
    } catch (error) {
        console.error('Eroare la executarea interogării:', error);
    } finally {
        if (connection) connection.release();
    }
    return result;
}

// Funcție pentru a inițializa baza de date MariaDB
async function initDb() {
    try {
        // Crearea tabelei 'utilizatori'
        await connectMariaDB('CREATE TABLE IF NOT EXISTS utilizatori (id INT PRIMARY KEY AUTO_INCREMENT, utilizator VARCHAR(255), parola VARCHAR(255), creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
        
        // Verificarea și adăugarea utilizatorului implicit dacă nu există utilizatori în baza de date
        const utilizatori = await connectMariaDB('SELECT * FROM utilizatori');
        if (utilizatori.length === 0) {
            const password = await sha256('secretpass123');
            await connectMariaDB('INSERT INTO utilizatori (utilizator, parola) VALUES (?, ?)', ['admin_departamente', password]);
        }

        // Crearea tabelei 'statistici'
        await connectMariaDB('CREATE TABLE IF NOT EXISTS statistici (id INT PRIMARY KEY AUTO_INCREMENT, timestamp DATETIME NOT NULL, asterisk_memory FLOAT NOT NULL, callmaster_memory FLOAT NOT NULL, mariadb_memory FLOAT NOT NULL)');
        
        // Crearea tabelei 'extensii'
        await connectMariaDB('CREATE TABLE IF NOT EXISTS extensii (id INT PRIMARY KEY AUTO_INCREMENT, nume VARCHAR(255), extensie VARCHAR(255), parola VARCHAR(255), creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
        
        // Crearea tabelei 'gestionare_apeluri'
        await connectMariaDB(`
            CREATE TABLE IF NOT EXISTS gestionare_apeluri (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nume VARCHAR(255) NOT NULL,
                strategie VARCHAR(255) NOT NULL,
                timeout INT NOT NULL,
                autopauza BOOLEAN NOT NULL,
                creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crearea tabelei 'setari'
        await connectMariaDB('CREATE TABLE IF NOT EXISTS setari (id INT PRIMARY KEY AUTO_INCREMENT, bind_ip VARCHAR(255), bind_port INT)');
        
        // Adăugarea unei înregistrări implicite în tabela 'setari' dacă este goală
        const setari = await connectMariaDB('SELECT * FROM setari');
        if (setari.length === 0) {
            await connectMariaDB('INSERT INTO setari (bind_ip, bind_port) VALUES (?, ?)', ['0.0.0.0', 5060]);
        }

        // Crearea tabelei 'inregistrari_apeluri'
        await connectMariaDB(`
            CREATE TABLE IF NOT EXISTS inregistrari_apeluri (
                id INT AUTO_INCREMENT PRIMARY KEY,
                data_apel DATETIME NOT NULL,
                uniqueid VARCHAR(32) NOT NULL,
                numar_apelant VARCHAR(80) NOT NULL,
                numar_apelat VARCHAR(80) NOT NULL,
                durata INT NOT NULL,
                status VARCHAR(45) NOT NULL
            )
        `);
    } catch (error) {
        console.error('Eroare la inițializarea bazei de date:', error);
    }
}

// Funcție pentru a testa conexiunea la baza de date și a rula interogări simple
async function testDbConnection() {
    try {
        // Interogare simplă pentru tabelul 'extensii'
        const extensii = await connectMariaDB('SELECT * FROM extensii');
        console.log('Extensii:', extensii);

        // Interogare simplă pentru tabelul 'gestionare_apeluri'
        const coziApeluri = await connectMariaDB('SELECT * FROM gestionare_apeluri');
        console.log('Gestionare apeluri:', coziApeluri);

        // Interogare simplă pentru tabelul 'statistici'
        const statistici = await connectMariaDB('SELECT * FROM statistici');
        console.log('Statistici:', statistici);

        // Interogare simplă pentru tabelul 'departamente'
        const departamente = await connectMariaDB('SELECT * FROM departamente');
        console.log('Departamente:', departamente);

        // Interogare simplă pentru tabelul 'setari'
        const setari = await connectMariaDB('SELECT * FROM setari');
        console.log('Setari:', setari);

        // Interogare simplă pentru tabelul 'inregistrari_apeluri'
        const inregistrariApeluri = await connectMariaDB('SELECT * FROM inregistrari_apeluri');
        console.log('Inregistrari Apeluri:', inregistrariApeluri);

    } catch (error) {
        console.error('Eroare la testarea conexiunii la baza de date:', error);
    }
}

module.exports = {
    initDb,
    connectMariaDB,
    testDbConnection
};
