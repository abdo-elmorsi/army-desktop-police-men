import path from "node:path";
import betterSqlite3 from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { app } from "electron";
import { format } from "date-fns";

function sum(arr: [], prop: string) {
    return arr.reduce((accumulator, object) => {
        return accumulator + (prop ? +object[prop] : object);
    }, 0);
}

interface User {
    id?: number;
    username: string;
    password: string;
    role: string | null;
}

interface PoliceMen {
    id?: number;
    username: string;
    degree: string;
    policeNo: string;
    birthDate: string;
    joinDate: string;
    address: string;
    job: string;
    createdAt?: string;
    image?: string;
    description: string;
}

interface Result {
    lastInsertRowid: number;
}

interface TotalResult {
    totalCount: number;
}

class DatabaseManager {
    private static db: betterSqlite3.Database | null = null;

    private static getDatabasePath(): string {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return app.isPackaged
            ? path.join(app.getPath("userData"), "databases/database.db")
            : path.join(__dirname, "../../src/db/database.db");
    }

    public static initializeDatabase(): void {
        const dbPath = this.getDatabasePath();
        try {
            this.db = betterSqlite3(dbPath);
            console.log("Connected to the database.");

            // Create tables if they do not exist
            this.createTables();
        } catch (err) {
            console.error("Could not open database:", err);
        }
    }

    private static createTables(): void {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS policemen (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                degree TEXT NOT NULL,
                policeNo TEXT NOT NULL,
                birthDate TEXT NOT NULL,
                joinDate TEXT NOT NULL,
                address TEXT NOT NULL,
                job TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                image TEXT,
                description TEXT
            )`,
        ];

        queries.forEach((query) => {
            this.db?.exec(query);
        });

        // // Check and add missing columns
        // const columnCheck = this.db
        //     ?.prepare(`PRAGMA table_info(policemen);`)
        //     .all();
        // console.log({ columnCheck });

        // const descriptionColumnExists = columnCheck?.some(
        //     (column: any) => column.name === "description"
        // );
        // console.log({ descriptionColumnExists });

        // if (!descriptionColumnExists) {
        //     this.db?.exec(
        //         `ALTER TABLE policemen ADD COLUMN description TEXT;`
        //     );
        // }
    }

    private static prepareStatement(
        query: string
    ): betterSqlite3.Statement | undefined {
        try {
            return this.db?.prepare(query);
        } catch (err) {
            console.error("Error preparing statement:", err);
            return undefined;
        }
    }

    // ******************** Users ********************
    public static getUsers(): User[] {
        const query = "SELECT * FROM users";
        return this.executeQuery(query);
    }

    public static addUser(
        username: string,
        password: string,
        role: string
    ): { id?: number; username: string; role: string } {
        const stmt = this.prepareStatement(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
        );
        const result = stmt?.run(username, password, role) as Result;
        return { id: result?.lastInsertRowid, username, role };
    }

    public static updateUser(
        id: number,
        username: string,
        password: string,
        role: string
    ): { id: number; username: string; role: string } {
        const stmt = this.prepareStatement(
            "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?"
        );
        stmt?.run(username, password, role, id);
        return { id, username, role };
    }

    public static deleteUser(id: number): { success: boolean } {
        const stmt = this.prepareStatement("DELETE FROM users WHERE id = ?");
        stmt?.run(id);
        return { success: true };
    }

    // ******************** police men ********************

    public static addPoliceMan(
        username: string,
        degree: string,
        policeNo: string,
        birthDate: string,
        joinDate: string,
        address: string,
        job: string,
        image: string,
        description: string
    ): PoliceMen {
        const createdAt = format(new Date(), "yyyy-MM-dd");
        const stmt = this.prepareStatement(
            "INSERT INTO policemen (username, degree, policeNo, birthDate, joinDate, address, job, image, createdAt, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        const result = stmt?.run(
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            createdAt,
            description
        ) as Result;
        return {
            id: result?.lastInsertRowid,
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            createdAt,
            description,
        };
    }

    public static updatePoliceMan(
        id: number,
        username: string,
        degree: string,
        policeNo: string,
        birthDate: string,
        joinDate: string,
        address: string,
        job: string,
        image: string,
        description: string
    ): PoliceMen {
        const stmt = this.prepareStatement(
            "UPDATE policemen SET username = ?, degree = ?, policeNo = ?, birthDate = ?, joinDate = ?, address = ?, job = ?, image = ?, description = ? WHERE id = ?"
        );
        stmt?.run(
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            description,
            id
        );
        return {
            id,
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            description,
        };
    }

    public static deletePoliceMan(id: number): { success: boolean } {
        const stmt = this.prepareStatement(
            "DELETE FROM policemen WHERE id = ?"
        );
        stmt?.run(id);
        return { success: true };
    }

    // Existing methods for retrieving policemen
    public static async getPoliceMen(
        searchQuery?: string,
        limit?: number,
        offset?: number
    ): Promise<{
        data: PoliceMen[];
        pagination: { totalRecords: number; totalPages: number };
    }> {
        let query = `SELECT * FROM policemen`;
        const conditions: string[] = [];
        const params: (number | string)[] = [];

        // Add search filters for username, job, and address if searchQuery is provided
        if (searchQuery) {
            conditions.push(
                `policemen.username LIKE ?`,
                `policemen.policeNo LIKE ?`
            );
            const likeQuery = `%${searchQuery}%`;
            params.push(likeQuery, likeQuery); // Apply searchQuery to all three fields
        }

        if (conditions.length) {
            query += ` WHERE ${conditions.join(" OR ")}`;
        }

        query += ` ORDER BY policemen.createdAt DESC`;

        const countQuery = `SELECT COUNT(*) AS totalCount FROM (${query}) AS subquery`;
        const countStmt = this.prepareStatement(countQuery);
        const totalResult = countStmt?.get(...params) as TotalResult;
        const totalRecords = totalResult?.totalCount || 0;

        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;

        if (limit !== undefined) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset || 0);
        }

        const stmt = this.prepareStatement(query);
        const data = stmt?.all(...params) as PoliceMen[];

        return {
            data,
            pagination: {
                totalRecords,
                totalPages,
            },
        };
    }

    public static async getPoliceManById(
        policeMenId: number
    ): Promise<PoliceMen | null> {
        const query = `
            SELECT * FROM policemen WHERE id = ?`;
        const stmt = this.prepareStatement(query);
        const policemen = stmt?.get(policeMenId) as PoliceMen | null;

        if (!policemen) {
            return null;
        }

        return policemen || null;
    }

    private static executeQuery(query: string): any[] {
        try {
            const rows = this.db?.prepare(query).all();
            return rows || [];
        } catch (err) {
            console.error("Error executing query:", err);
            throw err;
        }
    }

    public static closeDatabase(): void {
        // No explicit close needed for better-sqlite3
        console.log("Database connection is closed.");
    }
}

export default DatabaseManager;
