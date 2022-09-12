import { createConnection } from "typeorm";

(async () => await createConnection())();

export default createConnection;
