
export class PermissionError extends Error {

    statusCode: number;

    constructor() {
        super();
        this.statusCode = 401;
        this.name = 'unauthorized';
    }
}