const mysql = require('mysql');
let pool = mysql.createPool({
    host: 'localhost',
    user: 'dmc16',
    password: 'cxzdsaewq'
});

// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
// });

function createDB(databaseName) {
    return new Promise((r, j) => pool.query(`create database ${databaseName}`, function (error, results, fields) {
        if (error) {
            j(error);
            throw error;
        }
        r(results);
    }));
}

function createTable(TableName, dbName) {
    let res = new Promise((r, j) => {
        pool.getConnection(function (err, connection) {
            let errset = [];
            if (err) errset.push(err);
            else connection.changeUser({database: dbName}, function () {
                connection.query(`create table ${TableName}(id int,data json,primary key (id))`, function (error, results, fields) {
                    if (error) {
                        errset.push(error);
                    }
                    if(errset.length) j(errset);
                    else r(results);
                    connection.release();
                });
            });
        });
    });
    return res;
}

function getConnection(options) {
    return new Promise((r,j) => {
        pool.getConnection(function (err, con) {
            if(err) j(err);
            else if(options) con.changeUser(options,function () {
                r(con);
            });
            else r(con);
        })
    })
}

function createDocument(json,TableName,querysrc) {
    return new Promise((r, j) => querysrc.query(`insert into ${TableName} values (1,'${json}')`, function (error, results, fields) {
        if (error) {
            j(error);
            throw error;
        }
        r(results);
    }));
}

function find(json,TableName){
    let keys=[];
    let values = [];
    for (let each in json){
        keys.push(`data->'$.${each}'`);
        values.push(json[each]);
    }
    let baseSql = 'select ';
    for(let i=0;i<keys.length;i++){
        baseSql+=keys[i];
        if (i!==keys.length-1) baseSql+=',';
    }
    baseSql+=` from ${TableName} where `;
    for(let i=0;i<values.length;i++){
        baseSql+=`${keys[i]}=${values[i]}`;
        if (i!==keys.length-1) baseSql+=' and ';
    }
    console.log(baseSql);
    // return new Promise((r, j) => querysrc.query(`select data->${json} from ${TableName} values (1,'${json}')`, function (error, results, fields) {
    //     if (error) {
    //         j(error);
    //         throw error;
    //     }
    //     r(results);
    // }));
}
// createTable('hello', 'node').catch(console.log);
// getConnection({database:'node'}).then(r => createDocument(JSON.stringify({a:1,b:'abc'}),'hello',r)).catch(console.log);
find({a:1,b:2},'hello');