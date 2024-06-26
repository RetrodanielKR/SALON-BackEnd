const getConnection = require('./getConnection');
const { Request } = require('tedious');

const execQuery = (query, parameters, callbackEvent) => {
    return new Promise((resolve, reject) => {
        getConnection().connect()
            .then(connection => {
                const request = new Request(query, (error) => {
                    if (error) {
                        reject(error);
                    }
                });

                if (parameters) {
                    parameters.forEach(parameter => {
                        request.addParameter(
                            parameter.name,
                            parameter.type,
                            parameter.value
                        );
                    });
                }

                const close = () => connection.close();

                request.on('error', error => {
                    close();
                    reject(error);
                });

                callbackEvent(request, close, resolve);
                connection.execSql(request);
            })
            .catch(error => reject(error));
    });
};

const execWriteCommand = (query, parameters) => {
    const callbackEvent = (request, close, resolve) => {
        request.on('requestCompleted', (rowCount, more) => {
            close();
            resolve({ rowCount, more });
        });
    };

    return execQuery(query, parameters, callbackEvent);
};

const execReadCommand = (query, parameters = null) => {
    const callbackEvent = (request, close, resolve) => {
        const responseRows = [];

        request.on('row', columns => {
            const row = {};
            columns.forEach(column => {
                row[column.metadata.colName] = column.value;
            });
            responseRows.push(row);
        });

        request.on('requestCompleted', () => {
            close();
            resolve(responseRows);
        });
    };

    return execQuery(query, parameters, callbackEvent);
};

module.exports = {
    execWriteCommand,
    execReadCommand,
};
