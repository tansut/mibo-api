import { DBManager } from '../';

export default class DbModelLoader {
    static use(db: DBManager) {
        return [
            require('./user').default(db.connection),
            require('./refreshToken').default(db.connection),
            require('./chat').default(db.connection),
            require('./consultant').default(db.connection)
        ]
    }
}
